import React, { useState, useCallback } from "react";
import PDFViewer from "./PDFViewer";
import InputFieldsPanel from "./InputFieldsPanel";
import PreviewModal from "./PreviewModal";
import usePDFOperations from "../hooks/usePDFOperations";

const PDFEditor = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Trying to upload file to the backend :
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileTryChange = (e) => {
    setFile(e.target.files[0]);
  };

  const {
    currentPage,
    totalPages,
    isLoading,
    handleFileChange,
    handleSave,
    generatePreviewPdf,
    setCurrentPage,
    pdfContainerRef,
    handleDrop,
    pageCanvases,
    inputFields,
    renderField,
    handleFieldDelete,
    pdfFile,
    handleSaveAndUpload,
  } = usePDFOperations();

  const handleUpload = useCallback(async () => {
    if (!pdfFile) {
      setMessage("Please select a PDF file first");
      return;
    }

    try {
      setMessage("Uploading PDF...");
      console.log("PDF File being uploaded:", pdfFile); // Add this line
      const result = await handleSaveAndUpload();
      setMessage("PDF uploaded and saved successfully");
      console.log("Upload and save result:", result);
    } catch (error) {
      console.error("Detailed error:", error); // Change this line
      setMessage("Error uploading and saving PDF: " + error.message);
    }
  }, [handleSaveAndUpload, pdfFile]);

  const closePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setShowPreview(false);
  }, [previewUrl]);

  const handlePreview = useCallback(async () => {
    setIsPreviewLoading(true);
    const url = await generatePreviewPdf();
    setPreviewUrl(url);
    setShowPreview(true);
    setIsPreviewLoading(false);
  }, [generatePreviewPdf]);

  return (
    <main className="flex-grow container  max-w-7xl p-4 ">
      <div className="flex justify-between mb-4 bg-slate-800 text-white p-4 shadow-md">
        <h1 className="text-2xl md:text-4xl font-bold">Edit PDF</h1>

        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        <div className="flex items-center gap-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed "
            onClick={handlePreview}
            disabled={isPreviewLoading}
          >
            {isPreviewLoading ? "Generating Preview..." : "Preview"}
          </button>
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            onClick={handleSave}
          >
            Save PDF
          </button>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            onClick={handleUpload}
          >
            Upload PDF
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          <InputFieldsPanel />
          <PDFViewer
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            pdfContainerRef={pdfContainerRef}
            handleDrop={handleDrop}
            pageCanvases={pageCanvases}
            inputFields={inputFields}
            renderField={renderField}
            handleFieldDelete={handleFieldDelete}
          />
        </div>
      )}

      <PreviewModal
        showPreview={showPreview}
        isPreviewLoading={isPreviewLoading}
        previewUrl={previewUrl}
        closePreview={closePreview}
      />
    </main>
  );
};

export default PDFEditor;
