


  //-----------------------------------------------------------------

  export const createSalesPieData = (data, onlyAxisColumn) => {

    const filteredData = data.map((item) => {
      const filteredItem = {};
      if (item[onlyAxisColumn] !== undefined) {
        filteredItem[onlyAxisColumn] = item[onlyAxisColumn];
      }
      return filteredItem;
    });
  
    const pieData = [];
    const valueCounts = {};
  
    filteredData.forEach((item) => {
      const value = item[onlyAxisColumn];
      if (value) {
        valueCounts[value] = (valueCounts[value] || 0) + 1;
      }
    });
  
    for (const [name, count] of Object.entries(valueCounts)) {
      pieData.push({ name, value: count });
    }
  
    return pieData;
  };
  


//---------------------------------------------------------------------

export const createRevenueBarData = (data, xAxisColumn,yAxisColumn) => {

  const data1 = data.map(item => item[xAxisColumn]);
  const data2 = data.map(item => item[yAxisColumn]);

  return { data1, data2 };

};



export function extractColumns(query) {
    const regex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(=|>=|<=|>|<|!=)\s*/g;
    let columns = [];
    let match;

    while ((match = regex.exec(query)) !== null) {
        columns.push(match[1]);
    }

    return columns;
}
