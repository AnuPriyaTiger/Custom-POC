import React, { useEffect, useState } from "react";
import ChartComponent from "../components/ChartComponent";
import { chartOptions } from "../utils/chartData";
import KPIComponent from "../components/KPIComponent";
import TableComponent from "../components/TableComponent";
import DBContentTable from "./DBContentTable";

import { Select, Tag, Input } from "antd";

import { createSalesPieData, createRevenueBarData } from "./helper";

const CHART_TYPES = {
  SELECT_CHART: "Select Chart",
  SALES_PIE: "Sales-Pie",
  REVENUE_BAR: "Revenue-Bar",
  GROWTH_LINE: "Growth-Line",
  KPI: "KPI",
  TABLE: "Table",
};

const PreviewWidget = ({ data, tableData }) => {
  const { name, description, length, width } = data || {};

  const defaultDimensions = { length: 300, width: 300 };

  const [chart_type, setChart_type] = useState(null);
  const [tableColoumns, setTableColoumns] = useState(null);

  const [selectedColumns, setSelectedColumns] = useState([]);

  const [xAxisColumn, setXAxisColumn] = useState(undefined);
  const [yAxisColumn, setYAxisColumn] = useState(undefined);
  const [onlyAxisColumn, setOnlyAxisColumn] = useState(undefined);

  // const handleCheckboxChange = (column) => {
  //   if (chart_type === 'Sales-Pie' && selectedColumns.length >= 1 && !selectedColumns.includes(column)) {
  //     return;
  //   }

  //   if ((chart_type === 'Revenue-Bar' || chart_type === 'Growth-Line') && selectedColumns.length >= 2 && !selectedColumns.includes(column)) {
  //     return;
  //   }
  //   setSelectedColumns((prevSelected) => {
  //     if (prevSelected.includes(column)) {
  //       return prevSelected.filter((col) => col !== column);
  //     } else {
  //       return [...prevSelected, column];
  //     }
  //   });

  // };

  //-------------------------------------------------------------------------

  useEffect(() => {
    if (tableData !== null && tableData.length > 0) {
      const columns = Object.keys(tableData[0]);
      setTableColoumns(columns);
    }
  }, [tableData]);

  useEffect(() => {
    if (tableColoumns && tableColoumns.length === 1) {
      setOnlyAxisColumn(tableColoumns[0]);
      setChart_type("Sales-Pie");
    }

    if (tableColoumns && tableColoumns.length === 2) {
      setXAxisColumn(tableColoumns[0]);
      setYAxisColumn(tableColoumns[1]);

      setChart_type("Revenue-Bar");
    }
  }, [chart_type, tableColoumns]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setChart_type(value);
  };

  const handleSelectChange = (value) => {
    setSelectedColumns(value);
  };

  const handleXAxisChange = (value) => {
    setXAxisColumn(value);
  };

  const handleOnlyAxisChange = (value) => {
    setOnlyAxisColumn(value);
  };

  // Handle change for Y-Axis select
  const handleYAxisChange = (value) => {
    setYAxisColumn(value);
  };

  const renderDimensions = () => {
    return (
      <p className="text-gray-600 text-sm mb-2">
        Dimensions: {length} × {width}
      </p>
    );
  };

  const renderContent = () => {
    if (chart_type === "KPI") {
      return <KPIComponent data={chartOptions["KPI"]} />;
    } else if (chart_type === "Table") {
      return <TableComponent data={chartOptions["Table"]} />;
    } else {
      let options = chartOptions[chart_type];

      if (!options) {
        return <p className="text-gray-500">No chart preview available</p>;
      }

      if (chart_type === "Sales-Pie") {
        const newData = createSalesPieData(tableData, onlyAxisColumn);

        options["series"][0]["data"] = newData;

        sessionStorage.setItem("OnlyAxis", onlyAxisColumn);
        sessionStorage.setItem("XAxis", "");
        sessionStorage.setItem("YAxis", "");
        sessionStorage.setItem("ChartType", chart_type);
      } else if (chart_type === "Revenue-Bar" || chart_type === "Growth-Line") {
        const { data1: newData1, data2: newData2 } = createRevenueBarData(
          tableData,
          xAxisColumn,
          yAxisColumn
        );

        options["xAxis"]["data"] = newData1;
        options["series"][0]["data"] = newData2;
        sessionStorage.setItem("XAxis", xAxisColumn);
        sessionStorage.setItem("YAxis", yAxisColumn);
        sessionStorage.setItem("OnlyAxis", "");
        sessionStorage.setItem("ChartType", chart_type);
      }

      return (
        <div
          className="border border-red-500"
          style={{
            width: `${width || defaultDimensions.width}px`,
            height: `${length || defaultDimensions.length}px`,
          }}
        >
          <ChartComponent
            chartOptions={options}
            dimensions={{
              width: width || defaultDimensions.width,
              length: length || defaultDimensions.length,
            }}
          />
        </div>
      );
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md w-1/2">
      {tableData !== null && <DBContentTable data={tableData} />}

      {tableData !== null && tableData.length > 0 && (
        <div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chart Type <span className="text-red-500">*</span>
            </label>
            <select
              name="chart_type"
              value={chart_type}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              required
            >
              {Object.values(CHART_TYPES).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {chart_type === "Sales-Pie" && (
            <div>
              <h3>Select Columns:</h3>
              <Select
                allowClear
                showSearch
                value={onlyAxisColumn}
                onChange={handleOnlyAxisChange}
                style={{ width: "100%" }}
                placeholder="Select columns"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children).toLowerCase().includes(input.toLowerCase())
                }
              >
                {tableColoumns &&
                  tableColoumns.map((col, index) => (
                    <Select.Option key={index} value={col}>
                      {col}
                    </Select.Option>
                  ))}
              </Select>

              <div style={{ marginTop: "10px" }}>
                <h4>Selected Columns:</h4>

                <div style={{ flex: 1, flexWrap: "wrap", gap: "10px" }}>
                  {onlyAxisColumn && (
                    <Tag color="blue">Y-Axis: {onlyAxisColumn}</Tag>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------ */}

          {(chart_type === "Revenue-Bar" || chart_type === "Growth-Line") && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "5px",
                }}
              >
                <div style={{ flex: 1, marginRight: "12px" }}>
                  <h4>X-Axis:</h4>
                  <Select
                    value={xAxisColumn}
                    onChange={handleXAxisChange}
                    style={{ width: "100%" }}
                    placeholder="Select X-Axis"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {tableColoumns &&
                      tableColoumns.map((col, index) => (
                        <Select.Option key={index} value={col}>
                          {col}
                        </Select.Option>
                      ))}
                  </Select>
                </div>

                <div style={{ flex: 1 }}>
                  <h4>Y-Axis:</h4>
                  <Select
                    value={yAxisColumn}
                    onChange={handleYAxisChange}
                    style={{ width: "100%" }}
                    placeholder="Select Y-Axis"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {tableColoumns &&
                      tableColoumns.map((col, index) => (
                        <Select.Option key={index} value={col}>
                          {col}
                        </Select.Option>
                      ))}
                  </Select>
                </div>
              </div>

              <div style={{ marginTop: "5px" }}>
                <h4>Selected Columns:</h4>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    {xAxisColumn && (
                      <Tag color="green" style={{ width: "100%" }}>
                        X-Axis: {xAxisColumn}
                      </Tag>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    {yAxisColumn && (
                      <Tag color="blue" style={{ width: "100%" }}>
                        Y-Axis: {yAxisColumn}
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 
      <h2 className="text-2xl font-semibold mb-4">Preview Widget</h2>
      {name && <h3 className="text-lg font-bold mb-2">{name}</h3>}
      {description && <p className="text-gray-600 mb-2">{description}</p>}
      {renderDimensions()} */}
          <div className="mt-4">{renderContent()}</div>
        </div>
      )}
    </div>
  );
};

export default PreviewWidget;
