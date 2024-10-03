import React from "react";
import { FaFont, FaCheckSquare, FaDotCircle, FaListUl } from "react-icons/fa";

const InputFieldsPanel = () => {
  const fieldTypes = [
    { type: "text", icon: FaFont },
    { type: "checkbox", icon: FaCheckSquare },
    { type: "radio", icon: FaDotCircle },
    { type: "dropdown", icon: FaListUl },
  ];

  const handleDragStart = (fieldType, event) => {
    event.dataTransfer.setData("text/plain", fieldType);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Input Fields
      </h3>
      <div className="space-y-4">
        {fieldTypes.map(({ type, icon: Icon }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(type, e)}
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 p-4 rounded-lg cursor-move transition duration-300 ease-in-out flex items-center space-x-3 group"
          >
            <Icon className="text-xl group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
            <span className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Drag
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InputFieldsPanel;
