"use client";
import React from "react";
import { Table, Button, Input, Dropdown, Tabs, Space } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  DownloadOutlined,
  CloseOutlined,
  DownOutlined
} from "@ant-design/icons";
import type { TableProps, MenuProps, TabsProps } from "antd";


const tabItems: TabsProps["items"] = [
  {
    key: "1",
    label: "All",
    children: "",
  },
  {
    key: "2",
    label: "Admins",
    children: "",
  },
  {
    key: "3",
    label: "Group Managers",
    children: "",
  },
  {
    key: "4",
    label: "Individual Users",
    children: "",
  },
];

const statusFilterItems: MenuProps["items"] = [
  {
    label: (
      <a
        href="https://www.antgroup.com"
        target="_blank"
        rel="noopener noreferrer">
        1st menu item
      </a>
    ),
    key: "0",
  },
  {
    label: (
      <a
        href="https://www.aliyun.com"
        target="_blank"
        rel="noopener noreferrer">
        2nd menu item
      </a>
    ),
    key: "1",
  },
  {
    type: "divider",
  },
  {
    label: "3rd menu item",
    key: "3",
  },
];

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
    status: "Deactivaded",
    dateAdded: "15 Nov, 2024",
    lastActive: "3 minutes ago",
  },
];

const Members: React.FC = () => {
  const [selectedRecord, setRecord] = React.useState({});
  console.log(selectedRecord);
  const [filteredInfo, setFilteredInfo] = React.useState({});
  const [currentTab, setTab] = React.useState("1");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredData = data.filter(item => {
    const tabCondition =
      currentTab === "2"
        ? item.roles.includes("Admin")
        : currentTab === "3"
        ? item.roles.includes("Group Manager")
        : currentTab === "4"
        ? item.roles.includes("User")
        : true;
    const searchCondition = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return tabCondition && searchCondition
  })


  const onTabChange = (key: string) => {
    setTab(key)
    console.log(currentTab);
  };

    const onTableChange: NonNullable<TableProps<DataType>["onChange"]> = (
      pagination,
      filters,
      sorter
    ) => {
      console.log("Various parameters", pagination, filters, sorter);
      setFilteredInfo(filters);
    };

    const clearFilters = () => {
      setFilteredInfo({});
    };

  // Menu Items
  const items: MenuProps["items"] = [
    {
      label: "Edit Access",
      key: "1",
    },
    {
      label: "Deactivate Account",
      key: "2",
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
      title: "Date Added",
      dataIndex: "dateAdded",
      key: "dateAdded",
      sorter: (a, b) => a.lastActive.localeCompare(b.lastActive),
      sortDirections: ["descend"],
    },
    {
      title: "Last Active",
      dataIndex: "lastActive",
      key: "lastActive",
      sorter: (a, b) => a.dateAdded.localeCompare(b.dateAdded),
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
      <div className="title flex items-center justify-between mb-4">
        <div>
          <h2>Manage Members</h2>
        </div>
        <div className="gap-2 flex">
          <Button>
            <DownloadOutlined />
            Export
          </Button>
          <Button>
            <PlusOutlined />
            Invite
          </Button>
        </div>
      </div>
      <Tabs defaultActiveKey="1" items={tabItems} onChange={onTabChange} />
      <div>
        <div className="flex items-center gap-1 mb-4">
          <Input
            className="max-w-72 mr-4"
            placeholder="Search members"
            prefix={<SearchOutlined />}
          />
          <Dropdown className="cursor-pointer" menu={{ items }} trigger={["click"]}>
            <div onClick={(e) => e.preventDefault()}>
              <Space>
                Status
                <DownOutlined />
              </Space>
            </div>
          </Dropdown>
          <Button type="text" onClick={clearFilters}>
            <CloseOutlined />
            Clear All
          </Button>
        </div>
        <Table<DataType>
          className="overflow-x-scroll"
          columns={columns}
          dataSource={filteredData}
          onChange={onTableChange}
        />
      </div>
    </>
  );
};

export default Members;
