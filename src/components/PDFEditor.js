import React, { useState, useCallback, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import PDFViewer from "./PDFViewer";
import InputFieldsPanel from "./InputFieldsPanel";
import PreviewModal from "./PreviewModal";
import usePDFOperations from "../hooks/usePDFOperations";
import {
  FaUpload,
  FaEye,
  FaSave,
  FaCloudUploadAlt,
  FaFile,
  FaSpinner,
} from "react-icons/fa";

const PDFEditor = () => {
  const { id } = useParams();
  const location = useLocation();
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("No file selected");

  const {
    currentPage,
    totalPages,
    isLoading,
    handleFileChange,
    handleSave,
    handleSaveAndUpload,
    generatePreviewPdf,
    setCurrentPage,
    pdfContainerRef,
    handleDrop,
    pageCanvases,
    inputFields,
    renderField,
    handleFieldDelete,
    loadExistingPDF,
    resetState,
  } = usePDFOperations();

  useEffect(() => {
    if (id) {
      loadExistingPDF(id).then((pdfInfo) => {
        setFileName(pdfInfo.name);
      });
    } else {
      // Reset state when navigating to New PDF page
      resetState();
      setFileName("No file selected");
    }
  }, [id, loadExistingPDF, resetState, location.pathname]);

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

  const handleUpload = useCallback(async () => {
    try {
      setIsUploading(true);
      setMessage("Uploading PDF...");
      const result = await handleSaveAndUpload(id);
      setMessage(
        id
          ? "PDF updated and saved successfully"
          : "PDF uploaded and saved successfully",
      );
      console.log("Upload and save result:", result);
    } catch (error) {
      console.error("Error uploading and saving PDF:", error);
      setMessage("Error uploading and saving PDF: " + error.message);
    } finally {
      setIsUploading(false);
    }
  }, [handleSaveAndUpload, id]);

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      handleFileChange(event);
    }
  };

  return (
    <main className="flex flex-col bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md p-6">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {!id && (
              <>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-blue-600/90 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300 inline-flex items-center"
                >
                  <FaUpload className="mr-2" />
                  Choose PDF
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={onFileChange}
                  className="hidden"
                />
              </>
            )}
            <div className="flex items-center text-gray-600">
              <FaFile className="mr-2" />
              <span className="truncate max-w-xs">{fileName}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
              onClick={handlePreview}
              disabled={isPreviewLoading}
            >
              {isPreviewLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaEye className="mr-2" />
              )}
              {isPreviewLoading ? "Generating..." : "Preview"}
            </button>
            <button
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
              onClick={handleSave}
            >
              <FaSave className="mr-2" />
              Save PDF
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300 ease-in-out flex items-center"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaCloudUploadAlt className="mr-2" />
              )}
              {isUploading ? "Uploading..." : id ? "Update Pdf" : "Upload PDF"}
            </button>
          </div>
        </div>
        {message && (
          <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded">
            {message}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row pt-4 gap-6">
          <div className="md:w-1/4">
            <InputFieldsPanel />
          </div>
          <div className="md:w-3/4 bg-white rounded-lg  p-6">
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
