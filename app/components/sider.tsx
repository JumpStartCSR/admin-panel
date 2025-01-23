"use client";
import React from "react";
import {
  AppstoreOutlined,
  CalendarOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  CodeSandboxOutlined,
  
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme, ConfigProvider } from "antd";

const SiderAnts = Layout.Sider;

const items: MenuItem[] = [
  {
    key: "workspace-sub",
    label: "Workspace Name",
    icon: <CodeSandboxOutlined />,
    children: [
      { key: "1", label: "Option 1" },
      { key: "2", label: "Option 2" },
      {
        key: "sub1-2",
        label: "Submenu",
        children: [
          { key: "3", label: "Option 3" },
          { key: "4", label: "Option 4" },
        ],
      },
    ],
  },
  {
    key: "dashboard",
    icon: <AppstoreOutlined />,
    label: "Dashboard",
  },
  { key: "groups", icon: <SettingOutlined />, label: "Groups" },
  {
    key: "members",
    icon: <CalendarOutlined />,
    label: "Members",
  },
  {
    key: "settings-sub",
    label: "Settings",
    icon: <SettingOutlined />,
    children: [
      {
        key: "setting-grp-general",
        icon: <SettingOutlined />,
        label: "General",
      },
      {
        key: "setting-grp-billing",
        icon: <SettingOutlined />,
        label: "Billing",
      },
      {
        key: "setting-grp-notifications",
        icon: <SettingOutlined />,
        label: "Notifications",
      },
      {
        key: "setting-grp-permissions",
        icon: <SettingOutlined />,
        label: "Permissions",
      },
    ],
  },
  {
    type: "divider",
  },
  {
    key: "invite",
    icon: <PlusOutlined />,
    label: "Invite",
  },
  {
    key: "help",
    icon: <QuestionCircleOutlined />,
    label: "Help & Support",
  },
];

const Sider: React.FC<{ onKeyChange: (key: string) => void }> = ({
  onKeyChange,
}) => {
  return (
    <SiderAnts
      collapsible={true}
      width={250}
      style={{ background: "#0b0707f !important" }}>
      <Menu
        style={{}}
        defaultSelectedKeys={["members"]}
        mode="inline"
        items={items}
        onClick={(e: { key: string }) => {
          onKeyChange(e.key);
        }}
      />
    </SiderAnts>
  );
};

export default Sider;
