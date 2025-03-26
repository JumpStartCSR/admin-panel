"use client";
import React from "react";
import { Card, Avatar, Row, Col, Space } from "antd";
import { UserOutlined, ProductOutlined } from "@ant-design/icons";

const groupsData = [
  {
    id: 1,
    name: "VA Pilot Group",
    description: "Short group description truncated here..",
    members: 21,
    leader: "Alex Smith",
  },
  {
    id: 2,
    name: "Physical Therapy Group A",
    description: "Short group description truncated here..",
    members: 12,
    leader: "Alex Smith",
  },
  {
    id: 3,
    name: "Physical Therapy Group B",
    description: "Short group description truncated here..",
    members: 18,
    leader: "Alex Smith",
  },
  {
    id: 4,
    name: "Rehabilitation Center",
    description: "Short group description truncated here..",
    members: 32,
    leader: "Alex Smith",
  },
];

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
  };
}

const Dashboard: React.FC<DashboardProps> = ({ onKeyChange, user }) => {
  const userName = user.username;

  return (
    <>
      <h1>Welcome Home, {userName}!</h1>
      <div className="title flex items-center justify-between mt-8 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3>Your Groups</h3>
            {/* <a
              onClick={() => {
                onKeyChange("groups");
              }}>
              view all
            </a> */}
          </div>
          <h6>Manage and access your groups here</h6>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {groupsData.map((group) => (
          <Col key={group.id}>
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
                  <div style={{ color: "#8c8c8c", marginBottom: "4px" }}>
                    {group.description}
                  </div>
                  <div style={{ fontSize: "14px", color: "#595959" }}>
                    {group.members} Members • Lead by{" "}
                    <Avatar
                      size="small"
                      icon={<UserOutlined />}
                      style={{ marginRight: "4px" }}
                    />
                    {group.leader}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Dashboard;
