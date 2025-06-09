import React, { useState, useEffect } from "react";
const RecomnchartsConfig = () => {


    const [charts, setCharts] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetchRecomnCharts();
            setCharts(response);
    
            console.log(response, "---------------charts response ------------");
          } catch (err) {
            //
          } finally {
            //
          }
        };
    
        fetchData();
      }, []);


    const getChartOptionsFromAPI = ({ chart_type, x_axis, y_axis }) => {
    switch (chart_type) {
        case "bar":
        return {
            xAxis: {
            type: "category",
            data: x_axis
            },
            yAxis: {
            type: "value"
            },
            series: [
            {
                data: y_axis,
                type: "bar"
            }
            ]
        };

        case "line":
        return {
            xAxis: {
            type: "category",
            data: x_axis
            },
            yAxis: {
            type: "value"
            },
            series: [
            {
                data: y_axis,
                type: "line"
            }
            ]
        };

        case "pie":
        return {
            series: [
            {
                type: "pie",
                radius: "50%",
                data: x_axis.map((label, i) => ({
                name: label,
                value: y_axis[i]
                }))
            }
            ]
        };

        default:
        return {};
    }
    };

    return (
    <div>
      {charts.map((chart, index) => (
        <ChartComponent
          key={index}
          chartOptions={getChartOptionsFromAPI(chart)}
          dimensions={{ width: 400, height: 300 }}
        />
      ))}
    </div>
  );
};

export default RecomnchartsConfig;

