import React, { useState } from "react";
import { Divider, Drawer, Flex, Layout, Slider, Space, Typography } from "antd";
import {
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  ArrowLeftOutlined,
  TableOutlined,
} from "@ant-design/icons";
import DraggableItems from "./DraggableItems";

const { Sider } = Layout;
const { Title } = Typography;

//icons should be changed
const navItems = [
  { icon: PieChartOutlined, key: "pieChart", badge: 0, title: "Pie Chart" },
  { icon: BarChartOutlined, key: "barChart", badge: 4, title: "Bar Chart" },
  { icon: LineChartOutlined, key: "lineChart", badge: 2, title: "Line Chart" },
  { icon: AreaChartOutlined, key: "areaChart", badge: 0, title: "Area Chart" },
  { icon: TableOutlined, key: "table", badge: 0, title: "Table" },
];

const AvailableWidgetsDrawer = ({ widgets }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [activeIcon, setActiveIcon] = useState(null);

  const handleIconClick = (iconName) => {
    setActiveIcon(iconName);
    setCollapsed(false);
  };

  const renderDrawerContent = () => {
    return (
      <>
        <Space className="mb-4">
          <ArrowLeftOutlined onClick={() => setCollapsed(true)} />
          <Title level={5} style={{ margin: 0 }}>
            Available Widgets
          </Title>
        </Space>
        <Divider className="my-3" />
        <div className="overflow-y-auto h-[calc(100vh-180px)]">
          <DraggableItems widgets={widgets} />
        </div>
      </>
    );
  };

  return (
    <>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="bg-white"
      >
        {collapsed ? (
          <Flex vertical align="center">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleIconClick(item.key)}
                className={`w-10 h-10 flex items-center justify-center rounded ${
                  activeIcon === item.key
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                } transition`}
              >
                <item.icon />
              </button>
            ))}
          </Flex>
        ) : (
          renderDrawerContent()
        )}
      </Sider>
    </>
  );
};

export default AvailableWidgetsDrawer;
