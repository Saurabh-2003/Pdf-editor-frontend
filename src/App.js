import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import PDFEditor from "./components/PDFEditor";
import PDFList from "./components/PDFList";
import * as pdfjsLib from "pdfjs-dist";
import { FaHome, FaFilePdf } from "react-icons/fa";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 sm:mb-0">
                <span className="text-blue-400">PDF</span> Editor
              </h1>
              <nav className="flex gap-6">
                <Link
                  to="/"
                  className="text-white flex items-center gap-2 hover:text-blue-300 transition duration-300"
                >
                  <FaHome className="text-lg" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <Link
                  to="/edit"
                  className="text-white flex items-center gap-2 hover:text-blue-300 transition duration-300"
                >
                  <FaFilePdf className="text-lg" />
                  <span className="hidden sm:inline">New PDF</span>
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<PDFList />} />
            <Route path="/edit/:id?" element={<PDFEditor />} />
          </Routes>
        </main>
        <footer className="bg-slate-800 text-white text-center py-4">
          <p>
            &copy; PDF Input Interaction Application (Full-Stack) by Saurabh
            Thapliyal
          </p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
