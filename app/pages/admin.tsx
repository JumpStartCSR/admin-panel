"use client";
import React from "react";
import { Table, Button, Input, Dropdown, Space } from "antd";
import { PlusOutlined, SearchOutlined, MoreOutlined } from "@ant-design/icons";
import type { TableProps, MenuProps } from "antd";

interface DataType {
  key: string;
  name: string;
  email: string;
  roles: string[];
  status: string;
  lastActive: string;
}

const data: DataType[] = [
  {
    key: "1",
    name: "Jane Doe",
    email: "jane.doe@org.com",
    roles: ["Admin"],
    status: "Onboarded",
    lastActive: "11 minutes ago",
  },
  {
    key: "2",
    name: "Sam Smith",
    email: "sam.smith@org.com",
    roles: ["Admin"],
    status: "Pending",
    lastActive: "32 minutes ago",
  },
  {
    key: "3",
    name: "Zoe Denver",
    email: "zoe@org.com",
    roles: ["Admin"],
    status: "Deactivaded",
    lastActive: "3 minutes ago",
  },
];

const Admin: React.FC = () => {
  const [selectedRecord, setRecord] = React.useState({});
  console.log(selectedRecord)


  // Menu Items
  const items: MenuProps["items"] = [
    {
      label: "1st menu item",
      key: "1",
    },
    {
      label: "2nd menu item",
      key: "2",
    },
    {
      label: "3rd menu item",
      key: "3",
    },
  ];

  // Columns for Table
  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["descend"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ["descend"],
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (_, { roles }) => (
        <>
          {roles.map((role) => {
            return role;
          })}
        </>
      ),
      sorter: (a, b) => a.roles[0].localeCompare(b.roles[0]),
      sortDirections: ["descend"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortDirections: ["descend"],
    },
    {
      title: "Last Active",
      dataIndex: "lastActive",
      key: "lastActive",
      sorter: (a, b) => a.lastActive.localeCompare(b.lastActive),
      sortDirections: ["descend"],
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const onClick: MenuProps["onClick"] = ({ key }) => {
          console.log(`Click on item ${key} in ${record.name}`);
          setRecord(record);
        };

        return (
          <Dropdown menu={{ items, onClick }}>
            <Button type="text">
              <MoreOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];
  return (
    <>
      <div className="title flex items-center justify-between">
        <div>
          <h3>Manage Admins</h3>
          <h5>
            Manage roles and onboarding status for admin accounts within your
            organization.
          </h5>
        </div>
        <Button>
          <PlusOutlined />
          Invite Admin
        </Button>
      </div>
      <div className="table mt-4 w-full">
        <Input
          className="mt-8 mb-4 w-full max-w-72"
          placeholder="Search members"
          prefix={<SearchOutlined />}
        />
        <Table<DataType> columns={columns} dataSource={data} />;
      </div>
    </>
  );
};

export default Admin;
