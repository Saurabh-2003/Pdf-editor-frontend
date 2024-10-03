import React from "react";

const PDFViewer = ({
  currentPage,
  totalPages,
  setCurrentPage,
  pdfContainerRef,
  handleDrop,
  pageCanvases,
  inputFields,
  renderField,
  handleFieldDelete,
}) => {
  return (
    <div className="flex-grow flex flex-col items-center">
      <div className="mb-4 flex items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-l disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="px-4 py-2 bg-gray-200">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-r disabled:bg-gray-300"
        >
          Next
        </button>
      </div>

      <div
        ref={pdfContainerRef}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative bg-white shadow-md border-2 overflow-hidden"
      >
        {pageCanvases[currentPage] && (
          <img
            src={pageCanvases[currentPage].toDataURL()}
            alt={`Page ${currentPage}`}
            className="w-full h-auto"
          />
        )}

        {(inputFields[currentPage] || []).map((field) =>
          renderField(field, handleFieldDelete),
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
