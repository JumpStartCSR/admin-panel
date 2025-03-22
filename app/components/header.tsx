"use client";
import React from "react";
import Image from "next/image"; 
import { Layout, Button, ConfigProvider, Input } from "antd";
import { SearchOutlined, BellOutlined, UserOutlined } from "@ant-design/icons";

const HeaderAnts = Layout.Header

const Header: React.FC = () => {
  return (
    <HeaderAnts className="flex items-center justify-between border-b-2 border-b-gray-100">
      <div className="flex items-center">
        {/* <Button
            style={{ width: "40px", height: "40px" }}
            type="text"
            shape="circle">
            <MenuOutlined style={{ fontSize: "20px" }} />
          </Button> */}
        <Image
          className="pt-2"
          src="/logo.png"
          alt="Holmz logo"
          width={76}
          height={32}
          quality={100}
        />
        <h1 style={{ color: "#007FAC" }} className="pl-2 font-bold text-lg ">
          Admin
        </h1>
      </div>
      <div className="flex items-center gap-1.5">
        <div style={{ width: "300px" }} className="flex">
          <Input
            size="large"
            placeholder="Search groups, members and more"
            prefix={<SearchOutlined />}
          />
        </div>
        <Button
          style={{ width: "40px", height: "40px" }}
          type="text"
          shape="circle">
          <BellOutlined style={{ fontSize: "20px" }} />
        </Button>
        <Button type="primary" shape="circle">
          <UserOutlined />
        </Button>
      </div>
    </HeaderAnts>
  );
};

export default Header;
