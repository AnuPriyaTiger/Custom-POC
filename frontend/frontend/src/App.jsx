import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Flex, Layout } from "antd";
import DashboardConfig from "./dashboard_config";
import WidgetConfig from "./widget_config";
import LandingPage from "./landing_page";
import MenuBar from "./components/MenuBar";
import { fetchDashboard } from "./utils/api";
import DashboardPage from "./dashboard_page";

const { Header, Sider, Content } = Layout;

const Home = () => (
  <div className="text-center mt-12">
    <h1 className="text-3xl font-bold">Welcome to the App</h1>
  </div>
);

const App = () => {
  const [dashboards, setDashboards] = useState({});
  const [dashboardKeyLabel, setDashboardKeyLabel] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchDashboard();
        console.log("Raw Result : ", result);
        if (result && result.length > 0) {
          const userDashboards = result[0]?.positions || {}; // Safely accessing the positions key
          console.log("Processed Dashboards: ", userDashboards);
          setDashboards(userDashboards);
          const dashboardKeyLabel = Object.keys(userDashboards).map((item) => ({
            key: item.toLowerCase().replaceAll(" ", "_"),
            label: item,
          }));
          setDashboardKeyLabel(dashboardKeyLabel);
        }
      } catch (error) {
        setError(error.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Router>
      <Layout className="min-h-screen">
        <Header className="flex justify-end items-center bg-[#0958d9]">
          <Avatar size={32} icon={<UserOutlined />} />
        </Header>

        <Layout className="w-full">
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            className="bg-[#1677ff] "
          >
            <MenuBar dashboards={dashboardKeyLabel} />
          </Sider>
          {/* Main Content */}
          <Content className="overflow-auto">
            <Routes>
              <Route
                path="/"
                element={
                  <LandingPage
                    dashboards={dashboardKeyLabel}
                    error={error}
                    loading={loading}
                  />
                }
              />
              <Route
                path="/dashboards/:dashboardKey"
                element={
                  <DashboardPage
                    dashboards={dashboards}
                    dashboardKeyLabel={dashboardKeyLabel}
                  />
                }
              />
              <Route path="/configuration" element={<DashboardConfig />} />
              <Route path="/widget" element={<WidgetConfig />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
