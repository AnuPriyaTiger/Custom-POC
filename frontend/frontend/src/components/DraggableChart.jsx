import React from "react";
import { useDraggable } from "@dnd-kit/core";

const DraggableChart = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
    });

  // Conditional styling to handle dragging state
  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    touchAction: "none", // Ensures smooth touch gestures
    opacity: isDragging ? 0.5 : 1, // Reduce opacity when dragging
    cursor: isDragging ? "grabbing" : "grab", // Change cursor during dragging
  };


  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
    >
      {children}
    </div>
  );
};

export default DraggableChart;
