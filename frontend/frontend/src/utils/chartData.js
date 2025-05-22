export const chartOptions = {
  "Sales-Pie": {
    type: "pie",
    series: [
      {
        type: "pie",
        radius: "50%",
        data: [
          { value: 500, name: "Sales" },
          { value: 300, name: "Marketing" },
          { value: 100, name: "Support" },
        ],
      },
    ],
  },
  "Revenue-Bar": {
    type: "bar",
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: ["2021", "2022", "2023", "2024", "2025"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        type: "bar",
        data: [250, 300, 150, 350, 400],
      },
    ],
  },
  "Growth-Line": {
    type: "line",
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        type: "line",
        data: [80, 130, 110, 90, 150],
      },
    ],
  },
  "Table": {
    type: "table",
    headers: ["City", "Population", "Country"],
    rows: [
      ["Tokyo", "37M", "Japan"],
      ["New York", "8.4M", "USA"],
      ["London", "9M", "UK"],
    ],
  },
  "KPI": {
    "type": "kpi",
    "label": "Website Traffic",
    "value": "1.5M",
    "goal": "2M",
    "previousValue": "1.6M",
    "percentageChange": -5,
    "lastUpdated": "01/02/2025"
  }
  ,

  // Additional Examples with completely new data
  "Product-Pie": {
    type: "pie",
    series: [
      {
        type: "pie",
        radius: "50%",
        data: [
          { value: 200, name: "Product A" },
          { value: 150, name: "Product B" },
          { value: 50, name: "Product C" },
        ],
      },
    ],
  },
  "Sales-Bar": {
    type: "bar",
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: ["Jan", "Feb", "Mar", "Apr", "May"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        type: "bar",
        data: [100, 200, 150, 300, 450],
      },
    ],
  },
  "Performance-Line": {
    type: "line",
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: ["Q1", "Q2", "Q3", "Q4"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        type: "line",
        data: [500, 450, 300, 700],
      },
    ],
  },
  "Product-Table": {
    type: "table",
    headers: ["Product", "Price", "Stock"],
    rows: [
      ["Laptop", "$1200", "200"],
      ["Smartphone", "$800", "500"],
      ["Headphones", "$150", "700"],
    ],
  },
  "Revenue-KPI": {
    type: "kpi",
    title: "Monthly Revenue",
    value: "$2M",
    change: "+10%",
  },
};
