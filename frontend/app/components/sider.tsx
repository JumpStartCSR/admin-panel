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
import { useAuth } from "../context/auth-context";

const SiderAnts = Layout.Sider;

const Sider: React.FC<{
  selectedkey: string;
  onKeyChange: (key: string) => void;
}> = ({ selectedkey, onKeyChange }) => {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState("Loading...");

  useEffect(() => {
    const fetchOrgName = async () => {
      try {
        const res = await fetch(`/api/user/get-user-org/${user?.id}`);
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

    if (user?.id) {
      fetchOrgName();
    }
  }, [user?.id]);

  const userRoles = user?.roles ?? [];

  const menuItems: MenuProps["items"] = [
    ...(userRoles.includes("Super Admin")
      ? [
          {
            key: "organizations",
            label: "Organizations",
            icon: <CodeSandboxOutlined />,
          },
        ]
      : []),
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
        items={menuItems}
        onClick={(e) => onKeyChange(e.key)}
      />
    </SiderAnts>
  );
};

export default Sider;
