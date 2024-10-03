import { jsPDF } from "jspdf";

export const generatePdf = (
  totalPages,
  pageCanvases,
  pdfDimensions,
  inputFields,
) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pdfDimensions.width, pdfDimensions.height],
  });

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    if (pageNumber > 1) {
      pdf.addPage();
    }

    const canvas = pageCanvases[pageNumber];
    if (canvas) {
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfDimensions.width,
        pdfDimensions.height,
      );
    } else {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pdfDimensions.width, pdfDimensions.height, "F");
    }

    const fields = inputFields[pageNumber] || [];
    fields.forEach((field) => {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(field.left, field.top, field.width, field.height, "F");
      pdf.setTextColor(0);

      const fontSize = Math.max(8, Math.min(18, field.height / 4));
      const iconSize = Math.min(
        fontSize,
        Math.min(field.width, field.height) * 0.4,
      );
      pdf.setFontSize(fontSize);

      switch (field.type) {
        case "text":
          pdf.setFont("helvetica", "normal");
          const splitText = pdf.splitTextToSize(
            field.content || "",
            field.width - 10,
          );
          pdf.text(splitText, field.left + 5, field.top + fontSize, {
            baseline: "top",
          });
          break;
        case "checkbox":
          pdf.rect(
            field.left + 5,
            field.top + (field.height - iconSize) / 2,
            iconSize,
            iconSize,
            "S",
          );
          if (field.checked) {
            pdf.setLineWidth(iconSize * 0.1);
            pdf.line(
              field.left + 5 + iconSize * 0.2,
              field.top + (field.height - iconSize) / 2 + iconSize * 0.5,
              field.left + 5 + iconSize * 0.4,
              field.top + (field.height - iconSize) / 2 + iconSize * 0.7,
            );
            pdf.line(
              field.left + 5 + iconSize * 0.4,
              field.top + (field.height - iconSize) / 2 + iconSize * 0.7,
              field.left + 5 + iconSize * 0.8,
              field.top + (field.height - iconSize) / 2 + iconSize * 0.3,
            );
            pdf.setLineWidth(1);
          }
          pdf.text(
            field.label || "Checkbox",
            field.left + iconSize + 10,
            field.top + field.height / 2,
            { baseline: "middle" },
          );
          break;
        case "radio":
          pdf.circle(
            field.left + iconSize / 2 + 5,
            field.top + field.height / 2,
            iconSize / 2,
            "S",
          );
          if (field.checked) {
            pdf.setFillColor(0);
            pdf.circle(
              field.left + iconSize / 2 + 5,
              field.top + field.height / 2,
              iconSize / 4,
              "F",
            );
          }
          pdf.text(
            field.label || "Radio",
            field.left + iconSize + 10,
            field.top + field.height / 2,
            { baseline: "middle" },
          );
          break;
        case "dropdown":
          pdf.text(
            field.selectedOption || "Select an option",
            field.left + 5,
            field.top + field.height / 2,
            { baseline: "middle" },
          );
          break;
        default:
          break;
      }
    });
  }

  return pdf;
};

export const renderPage = async (
  pdf,
  pageNumber,
  setPageCanvases,
  setPdfDimensions,
) => {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1.5 });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  setPdfDimensions({ width: viewport.width, height: viewport.height });

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  setPageCanvases((prev) => ({
    ...prev,
    [pageNumber]: canvas,
  }));
};
