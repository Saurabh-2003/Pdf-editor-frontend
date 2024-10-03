import React from "react";

const PreviewModal = ({
  showPreview,
  isPreviewLoading,
  previewUrl,
  closePreview,
}) => {
  if (!showPreview && !isPreviewLoading) return null;

  const handleClose = () => {
    console.log("Close button clicked");
    if (typeof closePreview === "function") {
      closePreview();
    } else {
      console.error("closePreview is not a function");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-11/12 h-5/6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Preview</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        {isPreviewLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <iframe
            src={previewUrl}
            className="w-full flex-grow border-2 border-gray-300 rounded"
            title="PDF Preview"
          />
        )}
      </div>
    </div>
  );
};

export default PreviewModal;
