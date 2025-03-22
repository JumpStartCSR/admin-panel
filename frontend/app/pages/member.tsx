"use client";
import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Dropdown,
  Menu,
  Checkbox,
  Space,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  CloseOutlined,
  DownOutlined,
} from "@ant-design/icons";
import type { TableProps, TabsProps } from "antd";

interface DataType {
  key: string;
  name: string;
  email: string;
  roles: string[];
  status: string;
  lastActive: string;
  dateAdded: string;
}

const data: DataType[] = [
  {
    key: "1",
    name: "Jane Doe",
    email: "jane.doe@org.com",
    roles: ["Admin"],
    status: "Onboarded",
    dateAdded: "15 Nov, 2024",
    lastActive: "11 minutes ago",
  },
  {
    key: "2",
    name: "Sam Smith",
    email: "sam.smith@org.com",
    roles: ["Group Manager"],
    status: "Pending",
    dateAdded: "15 Nov, 2024",
    lastActive: "32 minutes ago",
  },
  {
    key: "3",
    name: "Zoe Denver",
    email: "zoe@org.com",
    roles: ["User"],
    status: "Deactivated",
    dateAdded: "15 Nov, 2024",
    lastActive: "3 minutes ago",
  },
];

const Members: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleMenuClick =
    (
      setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>,
      selectedItems: string[]
    ) =>
    (e: any) => {
      const { key } = e;
      const updatedItems = selectedItems.includes(key)
        ? selectedItems.filter((item) => item !== key)
        : [...selectedItems, key];
      setSelectedItems(updatedItems);
    };

  const statusMenu = (
    <Menu>
      {["Onboarded", "Pending", "Deactivated"].map((status) => (
        <Menu.Item
          key={status}
          onClick={handleMenuClick(setSelectedStatuses, selectedStatuses)}>
          <Checkbox checked={selectedStatuses.includes(status)}>
            {status}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  const roleMenu = (
    <Menu>
      {["Admin", "Group Manager", "User"].map((role) => (
        <Menu.Item
          key={role}
          onClick={handleMenuClick(setSelectedRoles, selectedRoles)}>
          <Checkbox checked={selectedRoles.includes(role)}>{role}</Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
    setSelectedRoles([]);
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
    const matchesRole =
      selectedRoles.length === 0 ||
      selectedRoles.some((role) => item.roles.includes(role));
    return matchesSearch && matchesStatus && matchesRole;
  });

  const columns: TableProps<DataType>["columns"] = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "roles",
      key: "roles",
      render: (roles) => roles.join(", "),
    },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Date Added", dataIndex: "dateAdded", key: "dateAdded" },
    { title: "Last Active", dataIndex: "lastActive", key: "lastActive" },
  ];

  return (
    <>
      <div className="title flex items-center justify-between mb-4">
        <h2>Manage Members</h2>
        <div className="gap-2 flex">
          <Button icon={<DownloadOutlined />}>Export</Button>
          <Button icon={<PlusOutlined />}>Invite</Button>
        </div>
      </div>
      <div className="flex items-center mb-4 gap-2">
        <Input
          placeholder="Search Members"
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <Dropdown overlay={statusMenu} trigger={["click"]}>
          <Button type="text">
            Status <DownOutlined />
          </Button>
        </Dropdown>
        <Dropdown overlay={roleMenu} trigger={["click"]}>
          <Button type="text">
            Role <DownOutlined />
          </Button>
        </Dropdown>
        <Button type="text" onClick={clearFilters} icon={<CloseOutlined />}>
          Clear Filters
        </Button>
      </div>
      <Table<DataType>
        columns={columns}
        dataSource={filteredData}
        rowKey="key"
      />
    </>
  );
};

export default Members;
