"use client";
import React, { useState } from "react";
import { Table, Button, Input, Dropdown, Menu, Checkbox, Space } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  CloseOutlined,
  DownOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";

interface DataType {
  key: string;
  name: string;
  managers: string;
  department: string;
  members: number;
  priority: string;
  status: string;
  createdDate: string;
  lastActive: string;
}

const data: DataType[] = [
  {
    key: "1",
    name: "VA Pilot Group",
    managers: "AS",
    department: "VA - General",
    members: 45,
    priority: "High",
    status: "Active",
    createdDate: "11 Nov, 2024",
    lastActive: "11 minutes ago",
  },
  {
    key: "2",
    name: "Physical Therapy Group A",
    managers: "AS",
    department: "VA - Health Dept",
    members: 12,
    priority: "High",
    status: "Active",
    createdDate: "15 Nov, 2024",
    lastActive: "2 hours ago",
  },
  {
    key: "3",
    name: "Physical Therapy Group B",
    managers: "AS",
    department: "VA - Health Dept",
    members: 18,
    priority: "Medium",
    status: "Active",
    createdDate: "14 Nov, 2024",
    lastActive: "15 Nov, 2024",
  },
];

const Groups: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

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

  const priorityMenu = (
    <Menu>
      {["High", "Medium", "Low"].map((priority) => (
        <Menu.Item
          key={priority}
          onClick={handleMenuClick(setSelectedPriorities, selectedPriorities)}>
          <Checkbox checked={selectedPriorities.includes(priority)}>
            {priority}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  const statusMenu = (
    <Menu>
      {["Active", "Inactive", "Archived"].map((status) => (
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

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPriorities([]);
    setSelectedStatuses([]);
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPriority =
      selectedPriorities.length === 0 ||
      selectedPriorities.includes(item.priority);
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const columns: TableProps<DataType>["columns"] = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Managers", dataIndex: "managers", key: "managers" },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Members", dataIndex: "members", key: "members" },
    { title: "Priority", dataIndex: "priority", key: "priority" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Created Date", dataIndex: "createdDate", key: "createdDate" },
    { title: "Last Active", dataIndex: "lastActive", key: "lastActive" },
  ];

  return (
    <>
      <div className="title flex items-center justify-between mb-4">
        <h2>Manage Groups</h2>
        <div className="gap-2 flex">
          <Button icon={<DownloadOutlined />}>Export</Button>
          <Button icon={<PlusOutlined />}>Add Group</Button>
        </div>
      </div>
      <div className="flex items-center mb-4">
        <Input
        className="mr-1"
          placeholder="Search Groups"
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <Dropdown overlay={priorityMenu} trigger={["click"]}>
          <Button type="text">
            Priority <DownOutlined />
          </Button>
        </Dropdown>
        <Dropdown overlay={statusMenu} trigger={["click"]}>
          <Button type="text">
            Status <DownOutlined />
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

export default Groups;
