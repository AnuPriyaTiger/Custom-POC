import React, { useState } from "react";
import { Resizable } from "re-resizable";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import KPIComponent from "./KPIComponent";
import TableComponent from "./TableComponent";
import ChartComponent from "./ChartComponent";

import { getWidgetData } from "../utils/api";

const ResizableDropZone = ({ id, size, onDrop, onResizeStop }) => {
  const { setNodeRef } = useDroppable({ id });
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
  } = useDraggable({
    id,
  });

  const [containerSize, setContainerSize] = useState(size);
  const stepSize = 100; // Step size for resizing
  const roundToStep = (value) => Math.round(value / stepSize) * stepSize;

  // Update container size on resize
  const handleResizeStop = (e, direction, ref) => {
    const newWidth = roundToStep(ref.offsetWidth);
    const newHeight = roundToStep(ref.offsetHeight);

    setContainerSize({
      width: newWidth,
      height: newHeight,
    });

    // Notify parent to update its state for the resized zone
    onResizeStop && onResizeStop({ width: newWidth, height: newHeight });
  };


  

  const renderContent = () => {
    if (!onDrop) {
      return <span className="text-gray-400">Drop a chart or KPI here</span>;
    }


console.log("Ondrop", onDrop )
    switch (onDrop.type) {
      case "kpi":
        return <KPIComponent data={onDrop} />;
      case "table":
        return <TableComponent data={onDrop} />;
      case "pie":
      case "bar":
      case "line":
        return <ChartComponent chartOptions={onDrop} dimensions={{
          width: 300,
          length: 300,
        }}/>;
      default:
        return (
          <span className="text-red-500">
            Unsupported content type: {onDrop.type}
          </span>
        );
    }
  };

  return (
    <Resizable
      size={containerSize}
      minWidth={300}
      minHeight={300}
      maxWidth={600}
      maxHeight={600}
      onResizeStop={handleResizeStop}
      enable={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        bottomRight: true,
      }}
      style={{
        border: "2px solid #ccc",
        borderRadius: "8px",
        padding: "8px",
      }}
    >
      <div
        ref={(node) => {
          setNodeRef(node);
          setDraggableRef(node);
        }}
        className="w-full h-full flex items-center justify-center"
        {...listeners}
        {...attributes}
        style={{ cursor: "move" }}
      >
        {renderContent()}
      </div>
    </Resizable>
  );
};

export default ResizableDropZone;
