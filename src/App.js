import React from "react";
import PDFEditor from "./components/PDFEditor";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const App = () => {
  return (
    <div className="flex justify-center  min-h-screen bg-gray-100 ">
      <PDFEditor />
    </div>
  );
};

export default App;
