"use client";
import React, { useEffect, useState } from "react";
import {
  AppstoreOutlined,
  CodeSandboxOutlined,
  TeamOutlined,
  GroupOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";

const SiderAnts = Layout.Sider;

const items: MenuProps["items"] = [
  {
    key: "organizations",
    label: "Organizations",
    icon: <CodeSandboxOutlined />,
  },
  {
    key: "dashboard",
    icon: <AppstoreOutlined />,
    label: "Dashboard",
  },
  {
    key: "groups",
    icon: <GroupOutlined />,
    label: "Groups",
  },
  {
    key: "members",
    icon: <TeamOutlined />,
    label: "Members",
  },
];

const Sider: React.FC<{
  selectedkey: string;
  onKeyChange: (key: string) => void;
  userId: string;
}> = ({ selectedkey, onKeyChange, userId }) => {
  const [organizationName, setOrganizationName] = useState("Loading...");

  useEffect(() => {
    const fetchOrgName = async () => {
      try {
        const res = await fetch(`/api/organization-name/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setOrganizationName(data.name);
        } else {
          setOrganizationName("Unknown Organization");
        }
      } catch {
        setOrganizationName("Error Loading Org");
      }
    };

    if (userId) {
      fetchOrgName();
    }
  }, [userId]);

  return (
    <SiderAnts
      collapsible
      theme="light"
      width={250}
      style={{ background: "#ffffff", height: "100vh" }}>
      <div
        style={{
          padding: "16px 24px",
          fontWeight: "bold",
          fontSize: "14px",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
        <BankOutlined />
        {organizationName}
      </div>

      <Menu
        selectedKeys={[selectedkey]}
        mode="inline"
        items={items}
        onClick={(e) => onKeyChange(e.key)}
      />
    </SiderAnts>
  );
};

export default Sider;
