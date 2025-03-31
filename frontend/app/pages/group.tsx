"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Dropdown,
  Menu,
  Checkbox,
  Space,
  Modal,
  Form,
  Select,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CloseOutlined,
  DownOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";
import dayjs from "dayjs";

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

const Groups: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [data, setData] = useState<DataType[]>([
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
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DataType | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const handleAddGroup = (values: any) => {
    const newGroup: DataType = {
      key: String(Date.now()),
      name: values.name,
      managers: values.managers,
      department: values.department,
      members: 0,
      priority: values.priority,
      status: values.status,
      createdDate: dayjs().format("DD MMM, YYYY"),
      lastActive: "Just now",
    };
    setData([...data, newGroup]);
    setModalVisible(false);
    form.resetFields();
  };

  const handleEdit = (record: DataType) => {
    setSelectedGroup(record);
    setEditModalVisible(true);
  };

  // ✅ Sync form values when modal is mounted
  useEffect(() => {
    if (editModalVisible && selectedGroup) {
      editForm.setFieldsValue({
        name: selectedGroup.name,
        managers: selectedGroup.managers,
        department: selectedGroup.department,
        priority: selectedGroup.priority,
        status: selectedGroup.status,
      });
    }
  }, [editModalVisible, selectedGroup, editForm]);

  const handleUpdateGroup = (values: any) => {
    const updated = data.map((g) =>
      g.key === selectedGroup?.key ? { ...g, ...values } : g
    );
    setData(updated);
    setEditModalVisible(false);
  };

  const handleDelete = () => {
    setData(data.filter((g) => g.key !== selectedGroup?.key));
    setDeleteModalVisible(false);
  };

  const priorityMenu = (
    <Menu>
      {["High", "Medium", "Low"].map((priority) => (
        <Menu.Item
          key={priority}
          onClick={() => {
            setSelectedPriorities((prev) =>
              prev.includes(priority)
                ? prev.filter((p) => p !== priority)
                : [...prev, priority]
            );
          }}>
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
          onClick={() => {
            setSelectedStatuses((prev) =>
              prev.includes(status)
                ? prev.filter((s) => s !== status)
                : [...prev, status]
            );
          }}>
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
    {
      title: "Controls",
      key: "controls",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              setSelectedGroup(record);
              setDeleteModalVisible(true);
            }}>
            Remove
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="title flex items-center justify-between mb-4">
        <h2>Manage Groups</h2>
        <div className="gap-2 flex">
          <Button icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            Add Group
          </Button>
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

      {/* Add Modal */}
      <Modal
        title="Add New Group"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="Add Group">
        <Form layout="vertical" form={form} onFinish={handleAddGroup}>
          <Form.Item
            label="Group Name"
            name="name"
            rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Managers"
            name="managers"
            rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true }]}>
            <Select
              options={[
                { value: "High" },
                { value: "Medium" },
                { value: "Low" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "Active" },
                { value: "Inactive" },
                { value: "Archived" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Group"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => editForm.submit()}
        okText="Save Changes">
        <Form layout="vertical" form={editForm} onFinish={handleUpdateGroup}>
          <Form.Item
            label="Group Name"
            name="name"
            rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Managers"
            name="managers"
            rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true }]}>
            <Select
              options={[
                { value: "High" },
                { value: "Medium" },
                { value: "Low" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "Active" },
                { value: "Inactive" },
                { value: "Archived" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Remove Group"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="remove" type="primary" danger onClick={handleDelete}>
            Remove
          </Button>,
        ]}>
        Are you sure you want to remove <strong>{selectedGroup?.name}</strong>?
      </Modal>
    </>
  );
};

export default Groups;
