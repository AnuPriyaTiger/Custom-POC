import React, { useState } from 'react';
import PreviewWidget from './PreviewWidget';
import WidgetManager from './WidgetManager';

const WidgetConfig = () => {
  const [previewData, setPreviewData] = useState(null);
  const [tableData, setTableData] = useState(null);


  const [onlyAxisData, setOnlyAxisData] = useState([]);
  const [xAxisData, setXAxisData] = useState([]);
  const [yAxisData, setYAxisData] = useState([]);

  const handlePreview = (widgetData) => {
    setPreviewData({
      ...widgetData,
      chart_type: widgetData.chart_type || 'Sales-Pie',
    });
  };


  const handleTable = (tableContent) => {
    const firstTentableContent = tableContent.slice(0, 10);
    setTableData(firstTentableContent);
  };



  return (
    <div className="flex gap-4">
      <WidgetManager onPreview={handlePreview} handleTable={handleTable} />
      <PreviewWidget data={previewData} tableData={tableData}/>
    </div>
  );
};

export default WidgetConfig;
