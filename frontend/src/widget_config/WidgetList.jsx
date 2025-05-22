import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css"; // Import the CSS for the tooltip

const WidgetList = ({ onEdit, onDelete, widgets }) => {

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Widget List</h2>
      {widgets.length === 0 ? (
        <p className="text-gray-500">No widgets available.</p>
      ) : (
        <ul className="space-y-3">
          {widgets.map((widget, index) => (

            
            <li
              key={index}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-medium">{widget.name}</p>
                <p className="text-sm text-gray-500">{widget.description}</p>
              </div>
              <div className="flex gap-2 items-center">
                {/* Edit Icon with Tooltip */}
                <button
                  onClick={() => onEdit(widget, index)}
                  className="text-blue-500 hover:text-blue-700 transition"
                  data-tooltip-id="tooltip-edit"
                  data-tooltip-content="Edit Widget"
                >
                  <FaEdit size={18} />
                </button>
                {/* Delete Icon with Tooltip */}
                <button
                  onClick={() => onDelete(index)}
                  className="text-red-500 hover:text-red-700 transition"
                  data-tooltip-id="tooltip-delete"
                  data-tooltip-content="Delete Widget"
                >
                  <FaTrash size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Tooltip Definitions */}
      <Tooltip id="tooltip-edit" place="top" effect="solid" />
      <Tooltip id="tooltip-delete" place="top" effect="solid" />
    </div>
  );
};

export default WidgetList;
