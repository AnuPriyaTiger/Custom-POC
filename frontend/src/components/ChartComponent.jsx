import React from "react";
import ReactECharts from "echarts-for-react";

const ChartComponent = ({ chartOptions, dimensions }) => {
  const { width = 300, height = 300 } = dimensions;

  const getKey = () => {
    return JSON.stringify(chartOptions); 
  };

  return (
    <div style={{ width: `${width}px`, height: `${height}px` }}>
      <ReactECharts
        key={getKey()}
        option={chartOptions}
        style={{ height: "100%", width: "100%" }}
        opts={{
          renderer: "svg",
        }}
      />
    </div>
  );
};

export default ChartComponent;
