import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { createWidget, previewWidget, getChartInput } from "../utils/api";
import { MentionsInput, Mention } from "react-mentions";
import { suggestions } from "./constants";

import { extractColumns } from "./helper";
import { Input } from "antd";

const CHART_TYPES = {
  SALES_PIE: "Sales-Pie",
  REVENUE_BAR: "Revenue-Bar",
  GROWTH_LINE: "Growth-Line",
  KPI: "KPI",
  TABLE: "Table",
};

const DEFAULT_DIMENSIONS = {
  length: 300,
  width: 300,
};

const INITIAL_FORM_STATE = {
  name: "",
  description: "",
  length: DEFAULT_DIMENSIONS.length,
  width: DEFAULT_DIMENSIONS.width,
  chart_type: CHART_TYPES.SALES_PIE,
  query: "",
  table_name: "",
};

const CreateWidget = ({
  onSaveEdit,
  editData,
  onPreview,
  setWidgets,
  handleTable,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  const [suggestionList, setSuggestionList] = useState([]);
  const [coloumnData, setColoumnData] = useState({});
  const [tableList, setTableList] = useState({});

  let combinedArray2 = [];

  useEffect(() => {
    if (editData?.widget) {
      setFormData(editData.widget);
    }
  }, [editData]);

  useEffect(() => {
    const getChartInputInfo = async () => {
      const queryContent = await getChartInput();

      const selected_item = queryContent.columns_info.map(
        (item) => item.column_name
      );
      const table_list = queryContent.table_info.map((item) => item.table_name);

      // const transformedArray = selected_item.map(item => ({
      //   id: item,
      //   display: item
      // }));

      setTableList(table_list);

      const transformedData = queryContent.columns_info.reduce(
        (acc, section) => {
          for (const [key, columns] of Object.entries(section)) {
            acc[key] = columns.reduce((colAcc, column) => {
              colAcc[column.column_name] = column.type;
              return colAcc;
            }, {});
          }
          return acc;
        },
        {}
      );

      const convertedData = Object.keys(transformedData).reduce(
        (acc, sectionKey) => {
          acc[sectionKey] = Object.keys(transformedData[sectionKey]).map(
            (column) => ({
              id: column,
              display: column,
            })
          );
          return acc;
        },
        {}
      );

      setColoumnData(convertedData);

      // const combinedArray = [...suggestions, ...transformedArray];
      // const combinedArray = [...transformedArray, ...suggestions];
      setSuggestionList(suggestions);

      setFormData((prev) => ({
        ...prev,
        ["table_name"]: table_list[0],
      }));
    };

    getChartInputInfo();
  }, []);

  useEffect(() => {
    const new_columns = coloumnData[formData.table_name];

    if (new_columns !== undefined) {
      const temp = { id: formData.table_name, display: formData.table_name };
      const allColumns = [...new_columns, temp];
      setSuggestionList((list) => {
        const uniqueItems = [
          ...list,
          ...allColumns.filter(
            (newItem) =>
              !list.some((existingItem) => existingItem.id === newItem.id)
          ),
        ];

        return uniqueItems;
      });
    }
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Widget name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.query.trim()) {
      newErrors.query = "SQL query is required";
    }

    if (!formData.length || formData.length < 100) {
      newErrors.length = "Length must be at least 100px";
    }

    if (!formData.width || formData.width < 100) {
      newErrors.width = "Width must be at least 100px";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);

    if (!isNaN(numValue)) {
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const OnlyAxisColoumn = sessionStorage.getItem("OnlyAxis") || "";
    const XAxisColoumn = sessionStorage.getItem("XAxis") || "";
    const YAxisColoumn = sessionStorage.getItem("YAxis") || "";
    const ChartType = sessionStorage.getItem("ChartType") || "";

    const ParametersArr = extractColumns(formData.query);

    if (
      ChartType === "" ||
      (ChartType === "Sales-Pie" && OnlyAxisColoumn === "") ||
      ((ChartType === "Revenue-Bar" || ChartType === "Growth-Line") &&
        (XAxisColoumn === "" || YAxisColoumn === ""))
    ) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const newFormData = {
      name: formData.name,
      description: formData.description,
      length: formData.length,
      width: formData.width,
      chart_type: ChartType,
      query: formData.query,
      table_name: formData.table_name,
      only_axis: OnlyAxisColoumn,
      x_axis: XAxisColoumn,
      y_axis: YAxisColoumn,
      parameters: ParametersArr,
    };

    try {
      if (editData) {
        onSaveEdit(formData, editData.index);
        toast.success("Widget updated successfully!");
      } else {
        const createdWidget = await createWidget(newFormData);
        setWidgets((prevWidgets) => [...prevWidgets, createdWidget]);
        toast.success("Widget created successfully!");
      }

      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      console.error("Error saving widget:", error);
      toast.error("Failed to save widget. Please try again.");
    }
  };

  const handlePreview = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    try {
      onPreview(formData);
      const queryContent = await previewWidget(formData);
      handleTable(queryContent);
      toast.success("Widget previewed successfully!");
    } catch (error) {
      console.error("Error previewing widget:", error);
      toast.error("Failed to preview widget. Please try again.");
    }
  };

  //-------------------------------------------------------------------------

  const handleInputChange2 = (e) => {
    const value = e.target.value;
    const plainText = value.replace(
      /@\[[^\]]+\]\([^\)]+\)/g,
      (match, offset, string) => {
        const matches = match.match(/\(([^\)]+)\)/);
        return matches ? matches[1] : "";
      }
    );

    console.log("Converted plain text:", plainText.trim());

    setFormData({ ...formData, query: plainText });
  };

  //------------------------------------------

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {editData ? "Edit Widget" : "Create Widget"}
      </h2>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Widget Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter widget name"
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter description"
            required
            rows={3}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dimensions (Length × Width) <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <div className="w-1/2">
              <input
                type="number"
                name="length"
                value={formData.length}
                onChange={handleDimensionChange}
                className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 ${
                  errors.length ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Length (px)"
                min="100"
                required
              />
              {errors.length && (
                <p className="mt-1 text-sm text-red-500">{errors.length}</p>
              )}
            </div>
            <div className="w-1/2">
              <input
                type="number"
                name="width"
                value={formData.width}
                onChange={handleDimensionChange}
                className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 ${
                  errors.width ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Width (px)"
                min="100"
                required
              />
              {errors.width && (
                <p className="mt-1 text-sm text-red-500">{errors.width}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Table <span className="text-red-500">*</span>
          </label>
          <select
            name="table_name" // Ensure the name matches the property in formData
            value={formData.table_name} // Bind to formData.table_name
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
            required
          >
            {tableList.length > 0 &&
              tableList.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
          </select>
        </div>

        {/* 
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Query <span className="text-red-500">*</span>
          </label>

          <textarea
            name="query"
            value={formData.query}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 ${
              errors.query ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter SQL query"
            required
            rows={4}
          />
          {errors.query && (
            <p className="mt-1 text-sm text-red-500">{errors.query}</p>
          )}
        </div> */}

        {suggestionList.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Query <span className="text-red-500">*</span>
            </label>

            <Input
              name="query"
              value={formData.query}
              onChange={handleInputChange2}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 ${
                errors.query ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter SQL query"
              required
              rows={4}
            >
              {/* <Mention
                trigger=""
                // data={suggestionList.slice(0, 3)}
                data={suggestionList}
                // data={suggestionList.length > 0 && suggestionList.slice(0, 3)}
                // data={Array.isArray(suggestionList) ? suggestionList.slice(0, 3) : []}

                displayTransform={(id) => id}
              /> */}
            </Input>

            {errors.query && (
              <p className="mt-1 text-sm text-red-500">{errors.query}</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handlePreview}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {editData ? "Save Changes" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

CreateWidget.propTypes = {
  onSaveEdit: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  setWidgets: PropTypes.func.isRequired,
  editData: PropTypes.shape({
    widget: PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      length: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      chart_type: PropTypes.oneOf(Object.values(CHART_TYPES)).isRequired,
      query: PropTypes.string.isRequired,
    }),
    index: PropTypes.number,
  }),
};

export default CreateWidget;
