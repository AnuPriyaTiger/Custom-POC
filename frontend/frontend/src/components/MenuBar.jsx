import React, { useEffect, useState } from "react";
import {
  SettingOutlined,
  ContainerOutlined,
  DesktopOutlined,
  WechatOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { Button, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const MenuBar = ({ dashboards }) => {
  const [selectedKey, setSelectedKey] = useState([]);

  console.log(dashboards, "dashboard");
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const pathKey = pathname.split("/").pop();
    if (!selectedKey.includes(pathKey)) setSelectedKey([pathKey]);
  }, [pathname, selectedKey]);

  const items = [
    {
      key: "dashboards",
      label: "Dashboard",
      icon: <DesktopOutlined />,
      children: dashboards,
    },
    { key: "configuration", icon: <SettingOutlined />, label: "Configure" },
    { key: "widget", icon: <ContainerOutlined />, label: "Widget" },
    { key: "Chat", icon: <WechatOutlined />, label: "Chat" },
    { key: "Admin", icon: <UserOutlined />, label: "Admin" },
  ];

  const handleSelect = (info) => {
    console.log(info, "onselect");
    setSelectedKey(info.selectedKeys);
    let route;
    if (info.keyPath.length > 1) {
      route = info.keyPath.reverse().join("/");
    } else {
      route = info.keyPath[0];
    }
    navigate(route);
  };

  return (
    <Menu
      selectedKeys={selectedKey}
      mode="inline"
      theme="dark"
      // inlineCollapsed={collapsed}
      items={items}
      onSelect={handleSelect}
    />
  );
};
export default MenuBar;
