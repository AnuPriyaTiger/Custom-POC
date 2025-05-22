import React, { useState, useEffect } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  Layout,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Input,
  Modal,
  message,
} from "antd";
import { SaveOutlined, DragOutlined, LayoutOutlined } from "@ant-design/icons";
import DraggableItems from "../components/DraggableItems";
import DropZones from "../components/DropZones";
import { chartOptions } from "../utils/chartData";
import { saveDashboard, fetchWidgets, getWidgetData } from "../utils/api";

import {
  createRevenueBarData,
  createSalesPieData,
} from "../widget_config/helper";
import AvailableWidgetsDrawer from "../components/AvailableWidgetsDrawer";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const DashboardConfig = () => {
  const [droppedItems, setDroppedItems] = useState({});
  const [dropZones, setDropZones] = useState([
    { id: "dropzone-1", width: 300, height: 300 },
  ]);
  const [dashboardName, setDashboardName] = useState("");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [nameError, setNameError] = useState("");

  //------------------------------------------------------------------------------
  const [widgets, setWidgets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchWidgets();
        setWidgets(response);

        console.log(response, "---------------widget response ------------");
      } catch (err) {
        // setError("Failed to fetch widgets.");
      } finally {
        // setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGraphData = async (id) => {
    const resData = await getWidgetData(id);
    if (resData && Array.isArray(resData.widget_data)) {
      resData.widget_data = resData.widget_data.slice(0, 10);
    }
    return resData;
  };

  //------------------------------------------------------------------------------

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDrop = async (event) => {
    const { active, over } = event;

    const ifExists = widgets.some((item) => item.name === active.id);

    if (over && active.id !== over.id) {
      // if (chartOptions[active.id]) {
      if (ifExists) {
        const dropZoneId = over.id;
        const chartId = active.id;

        const foundObject = widgets.find((item) => item.name === chartId);
        const respData = await getGraphData(foundObject.id);

        const chart_type = foundObject.chart_type;

        let options = JSON.parse(JSON.stringify(chartOptions[chart_type]));

        if (chart_type === "Sales-Pie") {
          const newData = createSalesPieData(
            respData.widget_data,
            respData.only_axis
          );
          options["series"][0]["data"] = newData;
        } else if (
          chart_type === "Revenue-Bar" ||
          chart_type === "Growth-Line"
        ) {
          const { data1: newData1, data2: newData2 } = createRevenueBarData(
            respData.widget_data,
            respData.x_axis,
            respData.y_axis
          );
          options["xAxis"]["data"] = newData1;
          options["series"][0]["data"] = newData2;
        }

        setDroppedItems((prev) => {
          const droppedItem = options;
          // const droppedItem = foundObject[chartId];
          const newDroppedItems = {
            ...prev,
            [dropZoneId]: {
              ...droppedItem,
              name: chartId,
              widgetID: foundObject.id,
            },
          };

          if (!prev[dropZoneId]) {
            const newDropZoneId = `dropzone-${dropZones.length + 1}`;
            setDropZones((prevZones) => [
              ...prevZones,
              {
                id: newDropZoneId,
                width: 300,
                height: 300,
                name: chartId,
                widgetID: foundObject.id,
              },
            ]);
          }

          return newDroppedItems;
        });

        setDropZones((prevZones) =>
          prevZones.map((zone) =>
            zone.id === dropZoneId ? { ...zone, name: chartId } : zone
          )
        );
      } else {
        const sourceIndex = dropZones.findIndex(
          (zone) => zone.id === active.id
        );
        const targetIndex = dropZones.findIndex((zone) => zone.id === over.id);

        if (sourceIndex !== targetIndex) {
          const reorderedZones = [...dropZones];
          const [movedZone] = reorderedZones.splice(sourceIndex, 1);
          reorderedZones.splice(targetIndex, 0, movedZone);
          setDropZones(reorderedZones);
        }
      }
    }
  };

  const handleResizeStop = (newSize, zone) => {
    setDropZones((prevZones) =>
      prevZones.map((z) =>
        z.id === zone.id
          ? { ...z, width: newSize.width, height: newSize.height }
          : z
      )
    );
  };

  const validateDashboardName = (name) => {
    if (!name.trim()) {
      setNameError("Dashboard name is required");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleSaveDashboard = async () => {
    if (!validateDashboardName(dashboardName)) {
      return;
    }

    const gridUnit = 100;
    const positions = dropZones.reduce((acc, zone, index) => {
      const widgetName = droppedItems[zone.id]?.name || "graph";
      const widgetID = droppedItems[zone.id]?.widgetID || -1;

      const gridPosition = {
        grid: `${Math.ceil(zone.height / gridUnit)},${Math.ceil(
          zone.width / gridUnit
        )}`,
        position: index + 1,
        name: widgetName,
        width: zone.width,
        height: zone.height,
        widgetID: widgetID,
      };
      acc[zone.id] = gridPosition;
      return acc;
    }, {});

    const keys = Object.keys(positions);
    const updatedPositions = { ...positions };
    delete updatedPositions[keys[keys.length - 1]];

    const dashboardData = {
      [dashboardName]: {
        positions: updatedPositions,
      },
    };

    try {
      await saveDashboard(dashboardData);
      message.success("Dashboard saved successfully!");
      setIsSaveModalOpen(false);
      setDashboardName("");
    } catch (err) {
      message.error("Failed to save the dashboard.");
    }
  };

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white px-6 flex items-center justify-between">
        <Space>
          <LayoutOutlined className="text-blue-600" />
          <Title level={4} style={{ margin: 0 }}>
            Dashboard Configuration
          </Title>
        </Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => setIsSaveModalOpen(true)}
        >
          Save Dashboard
        </Button>
      </Header>

      <Layout>
        <DndContext sensors={sensors} onDragEnd={handleDrop}>
          <Content className="p-6">
            <Card className="w-full h-full">
              <div className="overflow-auto h-[calc(100vh-200px)]">
                <DropZones
                  dropZones={dropZones}
                  droppedItems={droppedItems}
                  onResizeStop={handleResizeStop}
                />
              </div>
            </Card>
          </Content>

          {/* <Sider theme="light" className="border-r border-gray-200">
            <div className="p-4">
              <Space className="mb-4">
                <DragOutlined className="text-gray-600" />
                <Title level={5} style={{ margin: 0 }}>
                  Available Widgets
                </Title>
              </Space>
              <Divider className="my-3" />
              <div className="overflow-y-auto h-[calc(100vh-180px)]">
                <DraggableItems widgets={widgets} />
              </div>
            </div>
          </Sider> */}
          <AvailableWidgetsDrawer widgets={widgets} />
        </DndContext>
      </Layout>

      <Modal
        title="Save Dashboard"
        open={isSaveModalOpen}
        onCancel={() => setIsSaveModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsSaveModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveDashboard}>
            Save
          </Button>,
        ]}
      >
        <div style={{ marginTop: 16 }}>
          <div>
            <label className="block mb-2">Dashboard Name</label>
            <Input
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Enter dashboard name"
            />
            {nameError && (
              <p className="text-red-500 text-sm mt-1">{nameError}</p>
            )}
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default DashboardConfig;
