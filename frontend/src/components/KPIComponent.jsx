import React from "react";

const KPIComponent = ({ data }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-4 w-full h-full">
      <div className="text-2xl font-bold">{data.label}</div>
      <div className="text-xl font-semibold text-blue-600">{data.value}</div>
      <div className="text-sm text-gray-600 mt-2">Goal: {data.goal}</div>
      <div className="text-sm text-gray-600 mt-2">
        Previous: {data.previousValue}
      </div>
      {data.percentageChange && (
        <div
          className={`text-sm mt-2 ${
            data.percentageChange > 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {data.percentageChange > 0 ? "▲" : "▼"}{" "}
          {Math.abs(data.percentageChange)}%
        </div>
      )}
      <div className="text-xs text-gray-500 mt-2">
        Last Updated: {data.lastUpdated}
      </div>
    </div>
  );
};

export default KPIComponent;
