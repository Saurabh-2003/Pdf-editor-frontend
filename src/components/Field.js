import React from "react";
import ResizableField from "./ResizableField";
import {
  FaFont,
  FaCheckSquare,
  FaDotCircle,
  FaCaretDown,
} from "react-icons/fa";

const Field = ({
  field,
  handleFieldChange,
  handleFieldResize,
  handleFieldMove,
  handleFieldDelete,
  currentPage,
}) => {
  const fontSize = Math.max(12, Math.min(18, field.height / 4));
  const iconSize = Math.min(
    fontSize,
    Math.min(field.width, field.height) * 0.4,
  );

  const handleDelete = () => {
    handleFieldDelete(currentPage, field.id);
  };

  const handleLabelChange = (e) => {
    handleFieldChange(currentPage, field.id, { label: e.target.value });
  };

  const fieldContent = () => {
    switch (field.type) {
      case "text":
        return (
          <textarea
            value={field.content || ""}
            onChange={(e) =>
              handleFieldChange(currentPage, field.id, {
                content: e.target.value,
              })
            }
            className="w-full h-full box-border bg-transparent border-none p-2 resize-none focus:outline-none"
            style={{ fontSize: `${fontSize}px` }}
            placeholder="Enter text here..."
          />
        );
      case "checkbox":
      case "radio":
        return (
          <div className="flex items-center w-full h-full">
            <input
              type={field.type}
              name={field.type === "radio" ? field.name : undefined}
              checked={field.checked || false}
              onChange={(e) =>
                handleFieldChange(currentPage, field.id, {
                  checked: e.target.checked,
                })
              }
              className="mr-2 flex-shrink-0 cursor-pointer"
              style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
            />
            <input
              type="text"
              value={field.label || ""}
              onChange={handleLabelChange}
              className="flex-grow bg-transparent border-none p-1 w-0 min-w-0 focus:outline-none"
              style={{
                fontSize: `${fontSize}px`,
                width: `calc(100% - ${iconSize + 10}px)`,
              }}
              placeholder={`Enter ${field.type} label...`}
            />
          </div>
        );
      case "dropdown":
        return (
          <select
            value={field.selectedOption || ""}
            onChange={(e) =>
              handleFieldChange(currentPage, field.id, {
                selectedOption: e.target.value,
              })
            }
            className="w-full h-full box-border bg-transparent border-none p-1 cursor-pointer appearance-none focus:outline-none"
            style={{ fontSize: `${fontSize}px` }}
          >
            <option value="">Select an option</option>
            {field.options.map((option, i) => (
              <option key={i} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <ResizableField
      field={field}
      onResize={handleFieldResize}
      onMove={handleFieldMove}
      onDelete={handleDelete}
    >
      <div className="relative w-full h-full bg-white overflow-hidden rounded shadow-sm border border-gray-200 hover:border-blue-300 transition-colors duration-200">
        <div>{fieldContent()}</div>
      </div>
    </ResizableField>
  );
};

export default Field;
