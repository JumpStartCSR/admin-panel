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
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CloseOutlined,
  DownOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";
import { useOrganization } from "../context/org-context";

interface DataType {
  key: string;
  name: string;
  priority: string;
  status: string;
  created_date: string;
  managers: string[];
  member_count: number;
}
interface GroupsProps {
  onViewDetail?: (id: number) => void;
}

const Groups: React.FC<GroupsProps> = ({ onViewDetail }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [data, setData] = useState<DataType[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DataType | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { organizationId } = useOrganization();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchGroups = async () => {
    if (typeof organizationId === "undefined") return;
    try {
      const res = await fetch(`/api/groups?organizationId=${organizationId}`);
      const result = await res.json();
      setData(result);
    } catch {
      messageApi.error("Failed to load groups.");
    }
  };

  const fetchMembers = async () => {
    if (typeof organizationId === "undefined") return;
    const res = await fetch(`/api/members?organizationId=${organizationId}`);
    const users = await res.json();
    setMembers(users);
  };

  useEffect(() => {
    fetchGroups();
    fetchMembers();
  }, [organizationId]);

  const handleAddGroup = async (values: any) => {
    const payload = {
      ...values,
      organizationid: organizationId,
      managers: values.manager_ids || [],
    };

    const res = await fetch("/api/groups", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      form.resetFields();
      setModalVisible(false);
      fetchGroups();
    } else {
      messageApi.error("Failed to add group.");
    }
  };

  const handleEdit = async (record: DataType) => {
    setSelectedGroup(record);

    try {
      const res = await fetch(`/api/groups/${record.key}/managers`);
      const data = await res.json();

      editForm.setFieldsValue({
        ...record,
        manager_ids: data.map((m: any) => m.userid),
      });

      setEditModalVisible(true);
    } catch (err) {
      console.error("Failed to load managers", err);
      editForm.setFieldsValue(record);
      setEditModalVisible(true);
    }
  };

  const handleUpdateGroup = async (values: any) => {
    if (!selectedGroup) return;

    const res = await fetch(`/api/groups/${selectedGroup.key}`, {
      method: "PUT",
      body: JSON.stringify({
        ...values,
        managers: values.manager_ids || [],
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setEditModalVisible(false);
      fetchGroups();
    } else {
      messageApi.error("Failed to update group.");
    }
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;

    try {
      const res = await fetch(`/api/groups/${selectedGroup.key}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteModalVisible(false);
        fetchGroups();
        messageApi.success("Group deleted successfully.");
      } else {
        const errorText = await res.text();
        if (errorText.includes("violates foreign key constraint")) {
          messageApi.error("This group still has users and cannot be deleted.");
        } else {
          messageApi.error("Failed to delete group.");
        }
      }
    } catch (err) {
      console.error("Deletion error:", err);
      messageApi.error("An unexpected error occurred.");
    }
  };

  const priorityMenu = (
    <Menu>
      {["High", "Medium", "Low"].map((priority) => (
        <Menu.Item
          key={priority}
          onClick={() =>
            setSelectedPriorities((prev) =>
              prev.includes(priority)
                ? prev.filter((p) => p !== priority)
                : [...prev, priority]
            )
          }>
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
          onClick={() =>
            setSelectedStatuses((prev) =>
              prev.includes(status)
                ? prev.filter((s) => s !== status)
                : [...prev, status]
            )
          }>
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
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Managers",
      dataIndex: "managers",
      key: "managers",
      render: (managers: string[]) => managers?.join(", "),
    },
    { title: "Members", dataIndex: "member_count", key: "member_count" },
    { title: "Priority", dataIndex: "priority", key: "priority" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Created Date",
      dataIndex: "created_date",
      key: "created_date",
    },
    {
      title: "Controls",
      key: "controls",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}>
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={(e) => {
              e.stopPropagation();
              setSelectedGroup(record);
              setDeleteModalVisible(true);
            }}>
            Remove
          </Button>
        </Space>
      ),
    },
  ];

  const managerOptions = members.map((member) => ({
    label: member.name,
    value: member.key,
  }));

  return (
    <>
      {contextHolder}
      <div className="title flex items-center justify-between mb-4">
        <h2>Manage Groups</h2>
        <Button icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Add Group
        </Button>
      </div>

      <div className="flex items-center mb-4 gap-2">
        <Input
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
        onRow={(record) => ({
          onClick: () => onViewDetail?.(parseInt(record.key)),
          style: { cursor: "pointer" },
        })}
      />

      {/* Add Group Modal */}
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
          <Form.Item
            label="Managers"
            name="manager_ids"
            rules={[{ required: true }]}>
            <Select
              mode="multiple"
              showSearch
              allowClear
              options={managerOptions}
              placeholder="Search and select group managers"
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Group Modal */}
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
          <Form.Item
            label="Managers"
            name="manager_ids"
            rules={[{ required: true }]}>
            <Select
              mode="multiple"
              showSearch
              allowClear
              options={managerOptions}
              placeholder="Search and select group managers"
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Group Modal */}
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
