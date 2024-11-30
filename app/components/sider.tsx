"use client";
import React from "react";
import {
  AppstoreOutlined,
  CalendarOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  PlusOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme, ConfigProvider } from "antd";

const SiderAnts = Layout.Sider;

const items: MenuItem[] = [
  {
    key: "org-sub",
    label: "Organization Name",
    icon: <AppstoreOutlined />,
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
    key: "workspace",
    icon: <CalendarOutlined />,
    label: "Workspace",
  },
  {
    key: "user-grp",
    label: "USER MANAGEMENT",
    type: "group",
    children: [
      { key: "user-grp-admin", icon: <SettingOutlined />, label: "Admin" },
      { key: "user-grp-user", icon: <SettingOutlined />, label: "User Accounts" },
    ],
  },
  {
    key: "group-grp",
    label: "Group MANAGEMENT",
    type: "group",
    children: [
      { key: "group-grp-group", icon: <SettingOutlined />, label: "Groups" }
    ],
  },
  {
    key: "report-grp",
    label: "REPORTS & ANALYTICS",
    type: "group",
    children: [
      { key: "report-grp-admin", icon: <SettingOutlined />, label: "Admin" },
      {
        key: "report-grp-user-sub",
        label: "User Accounts",
        children: [
          { key: "5", label: "Option 5" },
          { key: "6", label: "Option 6" },
        ],
      },
    ],
  },
  {
    key: "setting-grp",
    label: "SETTINGS",
    type: "group",
    children: [
      { key: "setting-grp-general", icon: <SettingOutlined />, label: "General" },
      { key: "setting-grp-billing", icon: <SettingOutlined />, label: "Billing" },
      { key: "setting-grp-notifications", icon: <SettingOutlined />, label: "Notifications" },
      { key: "setting-grp-permissions", icon: <SettingOutlined />, label: "Permissions" },
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
    <SiderAnts width={250} style={{ background: "#0b0707f !important" }}>
      <Menu
        style={{}}
        defaultSelectedKeys={["user-grp-admin"]}
        mode="inline"
        items={items}
        onClick={(e: { key: string; }) => {
          onKeyChange(e.key);
        }}
      />
    </SiderAnts>
  );
};

export default Sider;

