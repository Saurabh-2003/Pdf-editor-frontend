import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PDFList = () => {
  const [pdfs, setPdfs] = useState([]);

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/pdfs");
      if (!response.ok) {
        throw new Error("Failed to fetch PDFs");
      }
      const data = await response.json();
      setPdfs(data);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your PDFs</h2>
      <ul className="space-y-2">
        {pdfs.map((pdf) => (
          <li key={pdf._id} className="bg-white p-4 rounded shadow">
            <Link
              to={`/edit/${pdf._id}`}
              className="text-blue-600 hover:underline"
            >
              {pdf.name}
            </Link>
            <span className="ml-4 text-gray-500">
              Uploaded on: {new Date(pdf.createdAt).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PDFList;
