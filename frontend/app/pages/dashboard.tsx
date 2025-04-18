"use client";
import React, { useEffect, useState } from "react";
import { Card, Avatar, Row, Col, Space, message, Spin } from "antd";
import { UserOutlined, ProductOutlined } from "@ant-design/icons";
import { useOrganization } from "../context/org-context";

interface Group {
  key: number;
  name: string;
  managers: string[];
  member_count: number;
}

interface DashboardProps {
  onKeyChange: (key: string) => void;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    avatar?: string;
    PCG_status?: string;
    token: string;
    roles: string[];
  };
}

const Dashboard: React.FC<DashboardProps> = ({ onKeyChange, user }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const { organizationId } = useOrganization();

  useEffect(() => {
    const fetchGroups = async () => {
      if (typeof organizationId === "undefined") return;
      try {
        const res = await fetch(`/api/groups?organizationId=${organizationId}`);
        const data = await res.json();
        setGroups(data.slice(0, 6));
      } catch {
        messageApi.error("Failed to load group data.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [organizationId]);

  return (
    <>
      {contextHolder}
      <h1>Welcome Home, {user.username}!</h1>
      <div className="title flex items-center justify-between mt-8 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3>Your Groups</h3>
            <a onClick={() => onKeyChange("groups")}>view all</a>
          </div>
          <h6>Manage and access your groups here</h6>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {groups.map((group) => (
            <Col key={group.key}>
              <Card
                hoverable
                bordered
                style={{
                  minWidth: "360px",
                  minHeight: "100px",
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "8px",
                }}
                onClick={() => onKeyChange("groups")}>
                <Space
                  style={{ display: "flex", alignItems: "center" }}
                  size="large">
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#e6f7ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                    }}>
                    <ProductOutlined
                      style={{ fontSize: "24px", color: "#1677ff" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                      {group.name}
                    </div>
                    <div style={{ fontSize: "14px", color: "#595959" }}>
                      {group.member_count} Members • Lead by{" "}
                      <Avatar
                        size="small"
                        icon={<UserOutlined />}
                        style={{ marginRight: "4px" }}
                      />
                      {group.managers[0] || "—"}
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default Dashboard;
