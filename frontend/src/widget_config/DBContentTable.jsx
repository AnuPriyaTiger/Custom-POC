import React from 'react';
import { Tooltip } from 'antd'; // Import Tooltip from Ant Design

const Table = ({ data }) => {
  // Check if there is data to display
  if (!data || data.length === 0) {
    return <p style={{fontSize:"16px",width:"100%",textAlign:"center"}}><b> No data available </b></p>;
  }

  // Get the headers dynamically based on the keys of the first row
  const columns = Object.keys(data[0]);

  // Inline CSS for styling
  const tableContainerStyle = {
    width: '100%',
    maxHeight: '400px',  // You can adjust this value depending on your needs
    overflowY: 'auto',   // Enables vertical scrolling
    display: 'block',    // Ensures the table will be scrollable in the body
    border: '1px solid #ddd',
    scrollbarWidth: 'thin', // Reduce the scroll bar width (works in Firefox)
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle = {
    padding: '10px',
    textAlign: 'left',
    backgroundColor: '#f2f2f2',
    borderBottom: '1px solid #ddd',
    position: 'sticky',
    top: 0, // This will make the header sticky at the top
    zIndex: 1, // Ensures the header stays on top of the body
  };

  const tdStyle = {
    padding: '10px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
  };

  const trHoverStyle = {
    backgroundColor: '#f5f5f5',
  };

  const tooltipStyle = {
    whiteSpace: 'nowrap', // Prevents the tooltip from breaking text into multiple lines
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  };

  // Function to render cells with a tooltip for text overflow
  const renderCell = (content) => {
    if (content && content.length > 10) {
      return (
        <Tooltip title={content} placement="topLeft">
          <span style={tooltipStyle}>
            {content.substring(0, 10)}...
          </span>
        </Tooltip>
      );
    }
    return content;
  };

  return (
    <div style={tableContainerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} style={thStyle}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} style={index % 2 === 0 ? {} : trHoverStyle}>
              {columns.map((col) => (
                <td key={col} style={tdStyle}>
                  {renderCell(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
