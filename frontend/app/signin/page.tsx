"use client";
import React, { useState } from "react";
import { Input, Button, Form, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../context/auth-context";
import { useRouter } from "next/navigation";

const { Title } = Typography;

const SignIn: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const router = useRouter(); // ✅ Get the router

  const onFinish = async (values: any) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const { username, password } = values;

      // ✅ Mock login
      if (username === "admin" && password === "password") {
        login({ firstname: "William", lastname: "Wang" });

        // ✅ Redirect to root after login
        router.push("/");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
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
