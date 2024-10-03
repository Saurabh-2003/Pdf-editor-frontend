import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaFilePdf, FaEdit, FaCalendarAlt, FaTrash } from "react-icons/fa";

const PDFList = () => {
  const [pdfs, setPdfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:5000/api/pdfs");
      setPdfs(response.data);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/pdfs/${id}`);
      setPdfs(pdfs.filter((pdf) => pdf._id !== id));
    } catch (error) {
      console.error("Error deleting PDF:", error);
    }
    setDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-4xl font-bold text-center text-slate-800 relative pb-3 mb-10">
        Your PDFs
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-700"></span>
      </h2>
      {pdfs.length === 0 ? (
        <p className="text-center text-gray-500 my-8">No PDFs uploaded yet.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfs.map((pdf) => (
            <li
              key={pdf._id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <FaFilePdf className="text-red-500 text-2xl mr-2" />
                  <h3 className="text-lg font-semibold text-slate-700 truncate">
                    {pdf.name}
                  </h3>
                </div>
                <div className="flex flex-col text-sm text-gray-500">
                  <div className="flex items-center mb-1">
                    <FaCalendarAlt className="mr-1" />
                    <span>
                      Uploaded: {formatDateTime(pdf.createdAt).split("at")[0]}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <Link
                    to={`/edit/${pdf._id}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </Link>
                  <button
                    onClick={() => setDeleteId(pdf._id)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors duration-200"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deleteId && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="my-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete PDF
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this PDF? This action cannot
                  be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFList;
