"use client";
import React from "react";
import { Breadcrumb, Layout, Menu, theme, ConfigProvider } from "antd";
import Header from "../components/header";
import Sider from "../components/sider";
import Members from "./member";

const { Content } = Layout;

/**
 * request:
 * 1. standardized typography
 *
 */

const App: React.FC = () => {
  const [selectedKey, setSelectedKey] = React.useState<string | null>(
    "members"
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            headerBg: "#ffffff",
            siderBg: "#ffffff",
            contentBg: "#ffffff",
            bodyBg: "#ffffff",
          },
        },
      }}>
      <Layout className="h-screen">
        <Header />
        <Layout>
          <Sider onKeyChange={setSelectedKey} />
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
              {selectedKey == "members" ? <Members /> : <></>}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
