import React from "react";
import ResizableField from "./ResizableField";

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
            className="w-full h-full box-border bg-transparent border-none p-1 resize-none"
            style={{ fontSize: `${fontSize}px` }}
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
              className="mr-1 flex-shrink-0"
              style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
            />
            <input
              type="text"
              value={field.label || ""}
              onChange={handleLabelChange}
              className="flex-grow bg-transparent border-none p-1 w-0 min-w-0"
              style={{
                fontSize: `${fontSize}px`,
                width: `calc(100% - ${iconSize + 5}px)`,
              }}
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
            className="w-full h-full box-border bg-transparent border-none p-1"
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
      <div className="relative w-full h-full bg-transparent overflow-hidden">
        {fieldContent()}
      </div>
    </ResizableField>
  );
};

export default Field;
