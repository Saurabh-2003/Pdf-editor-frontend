import { useState, useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { generatePdf, renderPage } from "../utils/pdfUtils";
import Field from "../components/Field";

const usePDFOperations = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [inputFields, setInputFields] = useState({});
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [pageCanvases, setPageCanvases] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [originalPdf, setOriginalPdf] = useState(null);

  const pdfContainerRef = useRef(null);
  const draggedFieldType = useRef(null);

  const loadPdf = useCallback(async (fileData) => {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: fileData });
      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      await renderPage(pdf, 1, setPageCanvases, setPdfDimensions);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Error loading PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (file && file.type === "application/pdf") {
        setIsLoading(true);
        setOriginalPdf(file); // This should be the File object
        const reader = new FileReader();
        reader.onload = (e) => {
          setPdfFile(e.target.result); // This is the ArrayBuffer for rendering
          loadPdf(e.target.result);
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("Please select a PDF file");
      }
    },
    [loadPdf],
  );

  useEffect(() => {
    if (pdfDocument && !pageCanvases[currentPage]) {
      renderPage(pdfDocument, currentPage, setPageCanvases, setPdfDimensions);
    }
  }, [pdfDocument, currentPage, pageCanvases]);

  const createField = useCallback((type, x, y) => {
    const baseField = {
      id: Date.now(),
      left: x,
      top: y,
      width: 100,
      height: 30,
    };

    switch (type) {
      case "text":
        return { ...baseField, type, content: "" };
      case "checkbox":
        return { ...baseField, type, checked: false, label: "Checkbox" };
      case "radio":
        return {
          ...baseField,
          type,
          checked: false,
          name: `radioGroup_${Date.now()}`,
          label: "Radio",
        };
      case "dropdown":
        return {
          ...baseField,
          type,
          options: ["Option 1", "Option 2", "Option 3"],
          selectedOption: "",
        };
      default:
        return { ...baseField, type: "text", content: "" };
    }
  }, []);

  const handleFieldChange = useCallback((pageNumber, id, changes) => {
    setInputFields((prevFields) => ({
      ...prevFields,
      [pageNumber]: (prevFields[pageNumber] || []).map((field) =>
        field.id === id ? { ...field, ...changes } : field,
      ),
    }));
  }, []);

  const handleDragStart = useCallback((fieldType, event) => {
    draggedFieldType.current = fieldType;
    event.dataTransfer.setData("text/plain", fieldType);
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const rect = pdfContainerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (
        x >= 0 &&
        x <= pdfDimensions.width &&
        y >= 0 &&
        y <= pdfDimensions.height
      ) {
        const fieldType = event.dataTransfer.getData("text/plain");
        const newField = createField(fieldType, x, y);
        setInputFields((prevFields) => ({
          ...prevFields,
          [currentPage]: [...(prevFields[currentPage] || []), newField],
        }));
      }
    },
    [pdfDimensions.width, pdfDimensions.height, currentPage, createField],
  );

  // Add this new function
  const handleFieldDelete = useCallback((pageNumber, fieldId) => {
    setInputFields((prevFields) => ({
      ...prevFields,
      [pageNumber]: (prevFields[pageNumber] || []).filter(
        (field) => field.id !== fieldId,
      ),
    }));
  }, []);

  const handleFieldResize = useCallback(
    (id, newSize) => {
      setInputFields((prevFields) => ({
        ...prevFields,
        [currentPage]: (prevFields[currentPage] || []).map((field) =>
          field.id === id
            ? {
                ...field,
                ...newSize,
                width: Math.min(
                  Math.max(50, newSize.width),
                  pdfDimensions.width - field.left,
                ),
                height: Math.min(
                  Math.max(30, newSize.height),
                  pdfDimensions.height - field.top,
                ),
              }
            : field,
        ),
      }));
    },
    [currentPage, pdfDimensions],
  );

  const handleFieldMove = useCallback(
    (id, newPosition) => {
      setInputFields((prevFields) => ({
        ...prevFields,
        [currentPage]: (prevFields[currentPage] || []).map((field) =>
          field.id === id
            ? {
                ...field,
                left: Math.max(
                  0,
                  Math.min(newPosition.left, pdfDimensions.width - field.width),
                ),
                top: Math.max(
                  0,
                  Math.min(
                    newPosition.top,
                    pdfDimensions.height - field.height,
                  ),
                ),
              }
            : field,
        ),
      }));
    },
    [currentPage, pdfDimensions],
  );

  const handleSave = useCallback(() => {
    const pdf = generatePdf(
      totalPages,
      pageCanvases,
      pdfDimensions,
      inputFields,
    );
    pdf.save("edited_pdf.pdf");
  }, [totalPages, pageCanvases, pdfDimensions, inputFields]);

  const generatePreviewPdf = useCallback(async () => {
    try {
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        if (!pageCanvases[pageNumber]) {
          await renderPage(
            pdfDocument,
            pageNumber,
            setPageCanvases,
            setPdfDimensions,
          );
        }
      }

      const pdf = generatePdf(
        totalPages,
        pageCanvases,
        pdfDimensions,
        inputFields,
      );
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPreviewUrl(pdfUrl);
      return pdfUrl;
    } catch (error) {
      console.error("Error generating preview:", error);
      alert("Error generating preview. Please try again.");
    }
  }, [totalPages, pageCanvases, pdfDocument, pdfDimensions, inputFields]);

  const closePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const handleSaveAndUpload = useCallback(async () => {
    if (!originalPdf) {
      throw new Error("Please select a PDF file first");
    }

    try {
      // Upload the PDF
      const formData = new FormData();
      formData.append("pdf", originalPdf);

      console.log("Uploading file:", originalPdf); // Add this line for debugging

      const uploadResponse = await fetch(
        "http://localhost:5000/api/pdfs/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Failed to upload PDF: ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      const pdfId = uploadResult.pdf._id;

      // Prepare the pages data
      const pagesData = Object.entries(inputFields).map(
        ([pageNumber, fields]) => ({
          pageNumber: parseInt(pageNumber),
          fields: fields.map((field) => ({
            type: field.type,
            left: field.left,
            top: field.top,
            width: field.width,
            height: field.height,
            content: field.content,
            label: field.label,
            checked: field.checked,
            options: field.options,
            selectedOption: field.selectedOption,
          })),
        }),
      );

      // Save the field data
      const saveResponse = await fetch(
        `http://localhost:5000/api/pdfs/${pdfId}/fields`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pages: pagesData }),
        },
      );

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(`Failed to save PDF data: ${errorText}`);
      }

      const saveResult = await saveResponse.json();
      return { uploadResult, saveResult };
    } catch (error) {
      console.error("Error saving and uploading PDF:", error);
      throw error;
    }
  }, [originalPdf, inputFields]);

  const renderField = useCallback(
    (field) => (
      <Field
        key={field.id}
        field={field}
        handleFieldChange={handleFieldChange}
        handleFieldResize={handleFieldResize}
        handleFieldMove={handleFieldMove}
        handleFieldDelete={handleFieldDelete}
        currentPage={currentPage}
      />
    ),
    [
      handleFieldChange,
      handleFieldResize,
      handleFieldMove,
      handleFieldDelete,
      currentPage,
    ],
  );

  return {
    pdfFile,
    setPdfFile,
    currentPage,
    totalPages,
    isLoading,
    handleFileChange,
    handleSave,
    generatePreviewPdf,
    closePreview,
    setCurrentPage,
    pdfContainerRef,
    handleDrop,
    pageCanvases,
    inputFields,
    renderField,
    handleDragStart,
    handleFieldDelete,
    handleSaveAndUpload,
  };
};

export default usePDFOperations;
