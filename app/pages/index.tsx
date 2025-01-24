"use client";
import React from "react";
import { Breadcrumb, Layout, ConfigProvider, theme } from "antd";
import Header from "../components/header";
import Sider from "../components/sider";
import Members from "./member";
import Groups from "./group";
import Dashboard from "./dashboard";

const { Content } = Layout;

const App: React.FC = () => {
  const [selectedKey, setSelectedKey] = React.useState<string>(
    "dashboard"
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm, 
        token: {
          colorBgContainer: "#ffffff",
        },
        components: {
          Layout: {
            headerBg: "#ffffff",
            siderBg: "#ffffff",
            contentBg: "#ffffff",
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
            <Breadcrumb
              items={[{ title: "Home" }, { title: "List" }, { title: "App" }]}
              style={{ margin: "16px 0" }}
            />
            <Content
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
              }}>
              {selectedKey == "members" ? (
                <Members />
              ) : selectedKey == "groups" ? (
                <Groups />
              ) : selectedKey == "dashboard" ? (
                <Dashboard onKeyChange={setSelectedKey} />
              ) : (
                <></>
              )}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
