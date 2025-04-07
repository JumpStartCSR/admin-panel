"use client";
import React, { useState } from "react";
import { Input, Button, Form, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../context/auth-context";
import { useRouter } from "next/navigation";
import PocketBase from "pocketbase";

const { Title } = Typography;

const SignIn: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const { username, password } = values;
      const pb = new PocketBase("https://holmz-backend.pockethost.io");

      const userData = await pb
        .collection("users")
        .authWithPassword(username, password);
      const user = userData.record;

      const avatarUrl = user.avatar
        ? `https://holmz-backend.pockethost.io/api/files/users/${user.id}/${user.avatar}`
        : undefined;

      const roleRes = await fetch("/api/get-user-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pb_user_id: user.id }),
      });

      const { roles } = await roleRes.json();

      if (!roleRes.ok || !roles) {
        throw new Error("Failed to fetch user roles.");
      }

      login({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        PCG_status: user.PCG_status,
        avatar: avatarUrl,
        token: pb.authStore.token,
        roles: roles,
      });

      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-sm w-full bg-white p-6 shadow-md rounded-2xl">
        <Title level={3} className="text-center mb-6">
          Sign In
        </Title>
        <Form form={form} name="signin" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter your username" }]}>
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            validateStatus={errorMessage ? "error" : ""}
            help={errorMessage || ""}
            rules={[{ required: true, message: "Please enter your password" }]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SignIn;
