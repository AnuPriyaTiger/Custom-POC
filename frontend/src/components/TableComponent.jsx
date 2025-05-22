import React from "react";

const TableComponent = ({ data }) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <table
        style={{
          width: "100%",
          height: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
          overflowX: "auto",
        }}
      >
        <thead>
          <tr>
            {data.headers.map((header, index) => (
              <th
                key={index}
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                  backgroundColor: "#f4f4f4",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
