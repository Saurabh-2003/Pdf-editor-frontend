import React, { useState, useCallback, useRef } from "react";
import { FaGripLines, FaTimes, FaExpandArrowsAlt } from "react-icons/fa";

const ResizableField = ({ field, onResize, onMove, onDelete, children }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const fieldRef = useRef(null);

  const handleDragStart = useCallback(
    (e) => {
      e.preventDefault();
      setIsMoving(true);
      setStartPos({ x: e.clientX - field.left, y: e.clientY - field.top });
    },
    [field.left, field.top],
  );

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (isResizing) {
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        onResize(field.id, {
          width: Math.max(150, field.width + deltaX),
          height: Math.max(40, field.height + deltaY),
        });
        setStartPos({ x: e.clientX, y: e.clientY });
      } else if (isMoving) {
        onMove(field.id, {
          left: e.clientX - startPos.x,
          top: e.clientY - startPos.y,
        });
      }
    },
    [isResizing, isMoving, startPos, field, onResize, onMove],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setIsMoving(false);
  }, []);

  React.useEffect(() => {
    if (isResizing || isMoving) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, isMoving, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={fieldRef}
      style={{
        position: "absolute",
        left: `${field.left}px`,
        top: `${field.top}px`,
        width: `${field.width}px`,
        height: `${field.height}px`,
      }}
      className="group"
    >
      <div className="absolute -top-8 left-0 right-0 h-8 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between px-2 rounded-t-md">
        <div
          className="cursor-move flex items-center"
          onMouseDown={handleDragStart}
        >
          <FaGripLines className="mr-2 text-gray-200" />
          <span className="text-sm text-gray-200">{field.type}</span>
        </div>
        <button
          className="text-gray-200 hover:text-red-500 transition-colors duration-200"
          onClick={() => onDelete(field.id)}
          title="Delete field"
        >
          <FaTimes />
        </button>
      </div>
      <div className="w-full h-full bg-white border border-gray-300 rounded-md overflow-hidden">
        {children}
      </div>
      <div
        className="absolute right-0 bottom-0 w-4 h-4 flex items-center justify-center cursor-nwse-resize text-gray-400 hover:text-blue-500 transition-colors duration-200"
        onMouseDown={handleResizeStart}
        title="Resize field"
      >
        <FaExpandArrowsAlt size={10} />
      </div>
    </div>
  );
};

export default ResizableField;
