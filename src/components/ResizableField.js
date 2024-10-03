import React, { useState, useCallback, useRef } from "react";

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
          width: Math.max(50, field.width + deltaX),
          height: Math.max(30, field.height + deltaY),
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
      className="border border-gray-300 bg-white"
    >
      <div
        className="absolute top-0 left-0 right-0 h-6 bg-gray-200 cursor-move flex items-center justify-between px-2 text-xs"
        onMouseDown={handleDragStart}
      >
        <span>⋮⋮</span>
        <button
          className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
          onClick={() => onDelete(field.id)}
        >
          X
        </button>
      </div>
      <div className="mt-6 h-[calc(100%-24px)]">{children}</div>
      <div
        className="absolute right-0 bottom-0 w-4 h-4 bg-gray-400 cursor-nwse-resize"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};

export default ResizableField;
