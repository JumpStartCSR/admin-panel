"use client";
import React, { useState } from "react";
import { Layout, ConfigProvider, theme } from "antd";
import Header from "../components/header";
import Sider from "../components/sider";
import Members from "./member";
import Groups from "./group";
import GroupDetail from "../group/detail/[id]/page";
import Dashboard from "./dashboard";
import Organizations from "./organization";
import { useAuth } from "../context/auth-context";

const { Content } = Layout;

const App: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [selectedKey, setSelectedKey] = useState<string>("dashboard");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  if (!isLoggedIn) return null;

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { colorBgContainer: "#ffffff" },
        components: {
          Layout: {
            headerBg: "#ffffff",
            siderBg: "#ffffff",
            bodyBg: "#ffffff",
            colorBgLayout: "#ffffff",
          },
        },
      }}>
      <Layout className="h-screen">
        <Header />
        <Layout>
          <Sider selectedkey={selectedKey} onKeyChange={setSelectedKey} />
          <Layout style={{ padding: "0 24px 24px" }}>
            <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
              {selectedKey === "members" ? (
                <Members />
              ) : selectedKey === "groups" ? (
                selectedGroupId ? (
                  <GroupDetail
                    groupId={selectedGroupId}
                    onBack={() => setSelectedGroupId(null)}
                  />
                ) : (
                  <Groups
                    onViewDetail={(id: number) => setSelectedGroupId(id)}
                  />
                )
              ) : selectedKey === "organizations" ? (
                <Organizations/>
              ) : (
                <Dashboard onKeyChange={setSelectedKey} user={user!} />
              )}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
