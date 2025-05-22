import React, { useState, useEffect, useMemo } from "react";
import { Card, Row, Col, Spin, Typography, Select } from "antd";
import { chartOptions } from "../utils/chartData";
import ChartComponent from "../components/ChartComponent";
import KPIComponent from "../components/KPIComponent";
import TableComponent from "../components/TableComponent";

import { getWidgetData, previewWidget } from "../utils/api";

import {
  createRevenueBarData,
  createSalesPieData,
} from "../widget_config/helper";
import { useLocation } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const DashboardPage = ({ dashboards, dashboardKeyLabel }) => {
  const [loading, setLoading] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState({});
  const [tempSelectedWidget, setTempSelectedWidget] = useState("");
  console.log(selectedDashboard, "selectedashboard");
  const [graphFinalData, setGraphFinalData] = useState([]);

  const { pathname } = useLocation();
  const getColSpan = (gridString) => {
    if (!gridString) return 8;
    const [rows, cols] = gridString.split(",").map(Number);
    return Math.floor(24 / cols);
  };

  const sortedWidgets = useMemo(() => {
    if (selectedDashboard?.positions)
      return Object.entries(selectedDashboard.positions).sort(
        (a, b) => a.position - b.position
      );
    return [];
  }, [selectedDashboard?.positions]);

  //------------------------------------------------------------------

  const getGraphData = async (id) => {
    const resData = await getWidgetData(id);
    if (resData && Array.isArray(resData.widget_data)) {
      resData.widget_data = resData.widget_data.slice(0, 10);
    }
    return resData;
  };

  useEffect(() => {
    setLoading(true);
    console.log(pathname, "pathname");
    const pathKey = pathname.split("/").pop();

    const data = dashboardKeyLabel.filter((item) => item.key === pathKey);
    console.log(data, "data");
    if (data.length) setSelectedDashboard(dashboards[data[0].label]);
    setLoading(false);
  }, [dashboardKeyLabel, dashboards, pathname]);

  useEffect(() => {
    setLoading(true);
    const fetchGraphData = async () => {
      const responses = [];

      for (const [key, chartWidget] of sortedWidgets) {
        if (chartWidget.widgetID) {
          try {
            const responseData = await getGraphData(
              String(chartWidget.widgetID)
            );

            const query = responseData.query;

            let updatedFiltersList = responseData.filters_list.map(
              (filterItem) => {
                const key = Object.keys(filterItem)[0];
                const options = filterItem[key];

                const regex = new RegExp(`${key} = '(.*?)'`, "i");
                const match = query.match(regex);

                if (match) {
                  const selectedValue = match[1];

                  if (options.includes(selectedValue)) {
                    const reorderedOptions = [
                      selectedValue,
                      ...options.filter((option) => option !== selectedValue),
                    ];
                    return {
                      [key]: reorderedOptions,
                    };
                  }
                }

                return { [key]: options };
              }
            );

            const selected_option = updatedFiltersList.map((filterItem) => {
              const key = Object.keys(filterItem)[0];
              return filterItem[key][0];
            });

            responses.push({
              ...chartWidget,
              widget_data: responseData.widget_data,
              chart_type: responseData.chart_type,
              only_axis: responseData.only_axis,
              x_axis: responseData.x_axis,
              y_axis: responseData.y_axis,
              filters_list: updatedFiltersList,
              query: query,
              selected_option: selected_option,
            });
          } catch (error) {
            console.error(
              "Error fetching graph data for widgetID:",
              chartWidget.widgetID,
              error
            );
          }
        }
      }

      // Update the graphFinalData only if there is a change
      if (JSON.stringify(responses) !== JSON.stringify(graphFinalData)) {
        setGraphFinalData(responses);
      }
    };

    if (JSON.stringify(sortedWidgets) !== tempSelectedWidget) {
      fetchGraphData();
      setTempSelectedWidget(JSON.stringify(sortedWidgets));
    }
    setLoading(false);
  }, [graphFinalData, sortedWidgets, tempSelectedWidget]);

  // const updateQuery = (query, key, newValue) => {

  //   console.log(query,'----------query----')
  //   console.log(key,'----------key----')
  //   console.log(newValue,'----------newValue----')

  //   // const regex = new RegExp(`${key} = '(.*?)'`, 'i');
  //   // const updatedQuery = query.replace(regex, `${key} = '${newValue}'`);

  //   const regex = new RegExp(`${key} = '([^']*)'`, 'i');  // Match the value in single quotes
  //   const updatedQuery = query.replace(regex, `${key} = '${newValue}'`);

  //   console.log(updatedQuery,'----------updatedQuery----')

  //   return updatedQuery;
  // };

  const updateQuery = (query, key, newValue) => {
    const regex = new RegExp(`(${key}\\s*=\\s*)'?(\\w+)'?`, "i");
    const updatedQuery = query.replace(regex, `$1'${newValue}'`);
    return updatedQuery;
  };

  const handleSelectChange = async (index, key, value, query, filterIndex) => {
    const updatedGraphData = [...graphFinalData];
    // const updatedFiltersList = [...updatedGraphData[index].filters_list];

    const updatedQuery = updateQuery(query, key, value);

    const widget = {
      name: "",
      description: "",
      length: 300,
      width: 300,
      chart_type: "",
      query: updatedQuery,
      table_name: "",
    };

    const previewData = await previewWidget(widget);

    updatedGraphData[index].selected_option[filterIndex] = value;
    updatedGraphData[index].widget_data = previewData.slice(0, 10);

    setGraphFinalData(updatedGraphData);
  };

  if (loading) {
    return (
      <div className="p-8 w-full h-full ">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="!mb-0">
            Dashboard
          </Title>
        </div>
        <Spin spinning={loading} className="h-full w-full"></Spin>
      </div>
    );
  }

  return (
    <div className="p-8 w-full h-full">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="!mb-0">
          Dashboard
        </Title>
      </div>
      <Row gutter={[16, 16]}>
        {graphFinalData.map((chartWidget, index) => {
          const {
            grid,
            name,
            width,
            height,
            position,
            widget_data,
            only_axis,
            x_axis,
            y_axis,
            chart_type,
            query,
            selected_option,
          } = chartWidget;
          const colSpan = getColSpan(grid);
          let options = JSON.parse(JSON.stringify(chartOptions[chart_type]));

          if (chart_type === "Sales-Pie") {
            const newData = createSalesPieData(widget_data, only_axis);
            options["series"][0]["data"] = newData;
          } else if (
            chart_type === "Revenue-Bar" ||
            chart_type === "Growth-Line"
          ) {
            const { data1: newData1, data2: newData2 } = createRevenueBarData(
              widget_data,
              x_axis,
              y_axis
            );
            options["xAxis"]["data"] = newData1;
            options["series"][0]["data"] = newData2;
          }

          if (!options) {
            console.warn(`No chart options found for type: ${name}`);
            return null;
          }

          const filterList = chartWidget.filters_list;

          return (
            <Col
              key={index}
              span={colSpan}
              className="flex"
              style={{ order: position }} // Use position for ordering
            >
              <Card
                className="w-full shadow-sm hover:shadow-md transition-shadow duration-300"
                style={{ width, height }}
                title={
                  <>
                    <h2>{name}</h2>
                    <Row gutter={16}>
                      {filterList.map((filterItem, filterIndex) => {
                        const key = Object.keys(filterItem)[0];
                        const options = filterItem[key];
                        // const selectedValue = options[0];

                        return (
                          <Col span={8} key={filterIndex}>
                            <h1>{key.slice(0, 12)}:</h1>

                            <Select
                              style={{ width: "100%" }}
                              placeholder={`Select ${key}`}
                              value={selected_option[filterIndex]}
                              onChange={(value) =>
                                handleSelectChange(
                                  index,
                                  key,
                                  value,
                                  query,
                                  filterIndex
                                )
                              }
                            >
                              {options.map((option, optionIndex) => (
                                <Option key={optionIndex} value={option}>
                                  {option}
                                </Option>
                              ))}
                            </Select>
                          </Col>
                        );
                      })}
                    </Row>
                  </>
                }
              >
                {name === "KPI" ? (
                  <KPIComponent data={chartOptions[chart_type]} />
                ) : name === "Table" ? (
                  <TableComponent data={chartOptions[chart_type]} />
                ) : (
                  <ChartComponent
                    chartOptions={options || {}}
                    dimensions={{
                      width,
                      height,
                    }}
                  />
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default DashboardPage;
