import React from "react";

const InputFieldsPanel = () => {
  const handleDragStart = (fieldType, event) => {
    event.dataTransfer.setData("text/plain", fieldType);
  };

  return (
    <div className="md:w-64 bg-white p-6 h-fit rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-center bg-slate-100 py-2 rounded">
        Input Fields
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
        {["text", "checkbox", "radio", "dropdown"].map((fieldType) => (
          <div
            key={fieldType}
            draggable
            onDragStart={(e) => handleDragStart(fieldType, e)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-md cursor-move text-center transition duration-300 ease-in-out"
          >
            {fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InputFieldsPanel;
