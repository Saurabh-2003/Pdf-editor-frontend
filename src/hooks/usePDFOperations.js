import { useState, useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { generatePdf, renderPage } from "../utils/pdfUtils";
import Field from "../components/Field";
import axios from "axios";

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
  const [scaleFactor, setScaleFactor] = useState(1);

  const pdfContainerRef = useRef(null);
  const draggedFieldType = useRef(null);

  const loadPdf = useCallback(async (fileData) => {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: fileData });
      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      const { scale, dimensions } = await renderPage(
        pdf,
        1,
        setPageCanvases,
        setPdfDimensions,
      );
      setScaleFactor(scale);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Error loading PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pdfDocument && !pageCanvases[currentPage]) {
      renderPage(
        pdfDocument,
        currentPage,
        setPageCanvases,
        setPdfDimensions,
      ).then(({ scale }) => {
        setScaleFactor(scale);
      });
    }
  }, [pdfDocument, currentPage, pageCanvases]);

  useEffect(() => {
    const handleResize = () => {
      if (pdfDocument) {
        renderPage(
          pdfDocument,
          currentPage,
          setPageCanvases,
          setPdfDimensions,
        ).then(({ scale }) => {
          setScaleFactor(scale);
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pdfDocument, currentPage]);

  const loadExistingPDF = useCallback(
    async (id) => {
      try {
        setIsLoading(true);
        const infoResponse = await axios.get(
          `http://localhost:5000/api/pdfs/${id}/info`,
        );
        const pdfInfo = infoResponse.data;
        const pdfResponse = await axios.get(
          `http://localhost:5000/api/pdfs/${id}`,
          {
            responseType: "arraybuffer",
          },
        );
        const pdfArrayBuffer = pdfResponse.data;

        setPdfFile(pdfArrayBuffer);
        setOriginalPdf(
          new File([pdfArrayBuffer], pdfInfo.name, { type: "application/pdf" }),
        );
        await loadPdf(pdfArrayBuffer);

        setInputFields(
          pdfInfo.pages.reduce((acc, page) => {
            acc[page.pageNumber] = page.fields.map((field) => ({
              ...field,
              id: `${field.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              left: field.left / scaleFactor,
              top: field.top / scaleFactor,
              width: field.width / scaleFactor,
              height: field.height / scaleFactor,
            }));
            return acc;
          }, {}),
        );

        return pdfInfo;
      } catch (error) {
        console.error("Error loading existing PDF:", error);
        alert("Error loading PDF. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [loadPdf, scaleFactor],
  );

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (file && file.type === "application/pdf") {
        setIsLoading(true);
        setOriginalPdf(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPdfFile(e.target.result);
          loadPdf(e.target.result);
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("Please select a PDF file");
      }
    },
    [loadPdf],
  );

  const createField = useCallback(
    (type, x, y) => {
      const baseField = {
        id: Date.now(),
        left: x / scaleFactor,
        top: y / scaleFactor,
        width: 100 / scaleFactor,
        height: 30 / scaleFactor,
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
    },
    [scaleFactor],
  );

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
      const x = (event.clientX - rect.left) / scaleFactor;
      const y = (event.clientY - rect.top) / scaleFactor;

      if (
        x >= 0 &&
        x <= pdfDimensions.width / scaleFactor &&
        y >= 0 &&
        y <= pdfDimensions.height / scaleFactor
      ) {
        const fieldType = event.dataTransfer.getData("text/plain");
        const newField = createField(
          fieldType,
          x * scaleFactor,
          y * scaleFactor,
        );
        setInputFields((prevFields) => ({
          ...prevFields,
          [currentPage]: [...(prevFields[currentPage] || []), newField],
        }));
      }
    },
    [
      pdfDimensions.width,
      pdfDimensions.height,
      currentPage,
      createField,
      scaleFactor,
    ],
  );

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
                width: Math.min(
                  Math.max(50 / scaleFactor, newSize.width / scaleFactor),
                  pdfDimensions.width / scaleFactor - field.left,
                ),
                height: Math.min(
                  Math.max(30 / scaleFactor, newSize.height / scaleFactor),
                  pdfDimensions.height / scaleFactor - field.top,
                ),
              }
            : field,
        ),
      }));
    },
    [currentPage, pdfDimensions, scaleFactor],
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
                  Math.min(
                    newPosition.left / scaleFactor,
                    pdfDimensions.width / scaleFactor - field.width,
                  ),
                ),
                top: Math.max(
                  0,
                  Math.min(
                    newPosition.top / scaleFactor,
                    pdfDimensions.height / scaleFactor - field.height,
                  ),
                ),
              }
            : field,
        ),
      }));
    },
    [currentPage, pdfDimensions, scaleFactor],
  );

  const handleSave = useCallback(() => {
    const pdf = generatePdf(
      totalPages,
      pageCanvases,
      pdfDimensions,
      inputFields,
      scaleFactor,
    );
    pdf.save("edited_pdf.pdf");
  }, [totalPages, pageCanvases, pdfDimensions, inputFields, scaleFactor]);

  const generatePreviewPdf = useCallback(async () => {
    try {
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        if (!pageCanvases[pageNumber]) {
          await renderPage(pdfDocument, pageNumber, setPageCanvases);
        }
      }

      const pdf = generatePdf(
        totalPages,
        pageCanvases,
        pdfDimensions,
        inputFields,
        scaleFactor,
      );
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPreviewUrl(pdfUrl);
      return pdfUrl;
    } catch (error) {
      console.error("Error generating preview:", error);
      alert("Error generating preview. Please try again.");
    }
  }, [
    totalPages,
    pageCanvases,
    pdfDocument,
    pdfDimensions,
    inputFields,
    scaleFactor,
  ]);

  const closePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const handleSaveAndUpload = useCallback(
    async (id = null) => {
      if (!originalPdf) {
        throw new Error("Please select a PDF file first");
      }

      try {
        const formData = new FormData();
        formData.append("pdf", originalPdf);

        if (id) {
          formData.append("id", id);
        }
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

        const pagesData = Object.entries(inputFields).map(
          ([pageNumber, fields]) => ({
            pageNumber: parseInt(pageNumber),
            fields: fields.map((field) => ({
              type: field.type,
              left: field.left * scaleFactor,
              top: field.top * scaleFactor,
              width: field.width * scaleFactor,
              height: field.height * scaleFactor,
              content: field.content,
              label: field.label,
              checked: field.checked,
              options: field.options,
              selectedOption: field.selectedOption,
            })),
          }),
        );

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
          const errorData = await saveResponse.json();
          throw new Error(`Failed to save PDF data: ${errorData.message}`);
        }

        const saveResult = await saveResponse.json();
        return { uploadResult, saveResult };
      } catch (error) {
        console.error("Error saving and uploading PDF:", error);
        throw error;
      }
    },
    [originalPdf, inputFields, scaleFactor],
  );

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
        scaleFactor={scaleFactor}
      />
    ),
    [
      handleFieldChange,
      handleFieldResize,
      handleFieldMove,
      handleFieldDelete,
      currentPage,
      scaleFactor,
    ],
  );
  const resetState = useCallback(() => {
    setPdfFile(null);
    setPdfDocument(null);
    setCurrentPage(1);
    setTotalPages(0);
    setInputFields({});
    setPdfDimensions({ width: 0, height: 0 });
    setPageCanvases({});
    setIsLoading(false);
    setPreviewUrl(null);
    setOriginalPdf(null);
    setScaleFactor(1);
  }, []);

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
    loadExistingPDF,
    scaleFactor,
    pdfDimensions,
    resetState,
  };
};

export default usePDFOperations;
