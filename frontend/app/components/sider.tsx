"use client";
import React from "react";
import {
  AppstoreOutlined,
  CalendarOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  CodeSandboxOutlined,
  TeamOutlined,
  GroupOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme, ConfigProvider } from "antd";

const SiderAnts = Layout.Sider;

const items: MenuItem[] = [
  {
    key: "organizations",
    label: "Organizations",
    icon: <CodeSandboxOutlined />,
    // children: [
    //   { key: "1", label: "Option 1" },
    //   { key: "2", label: "Option 2" },
    // ],
  },
  {
    key: "dashboard",
    icon: <AppstoreOutlined />,
    label: "Dashboard",
  },
  { key: "groups", icon: <GroupOutlined />, label: "Groups" },
  {
    key: "members",
    icon: <TeamOutlined />,
    label: "Members",
  },
  // {
  //   key: "settings-sub",
  //   label: "Settings",
  //   icon: <SettingOutlined />,
  //   children: [
  //     {
  //       key: "setting-grp-general",
  //       icon: <SettingOutlined />,
  //       label: "General",
  //     },
  //     {
  //       key: "setting-grp-billing",
  //       icon: <SettingOutlined />,
  //       label: "Billing",
  //     },
  //     {
  //       key: "setting-grp-notifications",
  //       icon: <SettingOutlined />,
  //       label: "Notifications",
  //     },
  //     {
  //       key: "setting-grp-permissions",
  //       icon: <SettingOutlined />,
  //       label: "Permissions",
  //     },
  //   ],
  // },
  // {
  //   type: "divider",
  // },
  // {
  //   key: "invite",
  //   icon: <PlusOutlined />,
  //   label: "Invite",
  // },
  // {
  //   key: "help",
  //   icon: <QuestionCircleOutlined />,
  //   label: "Help & Support",
  // },
];

const Sider: React.FC<{
  selectedkey: string;
  onKeyChange: (key: string) => void;
}> = ({ selectedkey, onKeyChange }) => {
  return (
    <SiderAnts
      collapsible={true}
      theme="light"
      width={250}
      style={{
        background: "#0b0707f !important",
        height: "100vh",
      }}>
      <Menu
        style={{}}
        defaultSelectedKeys={["dashboard"]}
        selectedKeys={[selectedkey]}
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
