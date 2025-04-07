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
import { useAuth } from "../context/auth-context";

interface DataType {
  key: string;
  name: string;
  roles: string[];
  status: string;
  dateadded: string;
  lastActive: string;
}

const Members: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [data, setData] = useState<DataType[]>([]);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<DataType | null>(null);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { organizationId } = useOrganization();
  const { user } = useAuth();
  const currentUserRoles = user?.roles || [];

  const isSuperAdmin = currentUserRoles.includes("Super Admin");
  const isAdmin = currentUserRoles.includes("Admin");
  const isGM = currentUserRoles.includes("GM");

  useEffect(() => {
    fetchMembers();
  }, [organizationId]);

  const fetchMembers = async () => {
    const res = await fetch(`/api/members?organizationId=${organizationId}`);
    const members = await res.json();
    setData(members);
  };

  const handleAddMember = async (values: any) => {
    setUsernameError(null);
    const username = values.username;

    const pbRes = await fetch("/api/pb-user-lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!pbRes.ok) {
      setUsernameError("User not Found");
      return;
    }

    const { user: pbUser } = await pbRes.json();

    const payload = {
      pbUserID: pbUser.id,
      name: pbUser.name,
      roles: values.roles,
      status: values.status,
      organizationid: organizationId,
    };

    const res = await fetch("/api/members", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      form.resetFields();
      setModalVisible(false);
      fetchMembers();
    } else {
      message.error("Failed to add member.");
    }
  };

  const handleEdit = (record: DataType) => {
    setSelectedMember(record);
    editForm.setFieldsValue(record);
    setEditModalVisible(true);
  };

  const handleUpdateMember = async (values: any) => {
    if (!selectedMember) return;

    const res = await fetch(`/api/members/${selectedMember.key}`, {
      method: "PUT",
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setEditModalVisible(false);
      fetchMembers();
    } else {
      message.error("Failed to update member.");
    }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;

    const res = await fetch(`/api/members/${selectedMember.key}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setDeleteModalVisible(false);
      fetchMembers();
    } else {
      message.error("Failed to delete member.");
    }
  };

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
      {["Super Admin", "Admin", "GM", "Individual"].map((role) => (
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

  const canManageUser = (roles: string[]) => {
    if (isSuperAdmin) return true;
    if (isAdmin) return !roles.includes("Super Admin");
    if (isGM)
      return (
        roles.every((r) => r === "Individual") ||
        user?.id === selectedMember?.key
      );
    return false;
  };

  const roleOptions = [
    ...(isSuperAdmin ? [{ label: "Super Admin", value: "Super Admin" }] : []),
    ...(isAdmin || isSuperAdmin ? [{ label: "Admin", value: "Admin" }] : []),
    { label: "Group Manager", value: "GM" },
    { label: "Individual User", value: "Individual" },
  ];

  const columns: TableProps<DataType>["columns"] = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Role",
      dataIndex: "roles",
      key: "roles",
      render: (roles) => roles.join(", "),
    },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Date Added", dataIndex: "dateadded", key: "dateadded" },
    {
      title: "Controls",
      key: "controls",
      render: (_, record) => {
        const isSelf = user?.id === record.key;
        const canEdit = canManageUser(record.roles) || isSelf;

        return (
          <Space>
            <Button
              type="link"
              onClick={() => handleEdit(record)}
              disabled={!canEdit}>
              Edit
            </Button>
            <Button
              type="link"
              danger
              onClick={() => {
                setSelectedMember(record);
                setDeleteModalVisible(true);
              }}
              disabled={!canEdit}>
              Remove
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div className="title flex items-center justify-between mb-4">
        <h2>Manage Members</h2>
        <Button icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Invite Member
        </Button>
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

      {/* Add Member Modal */}
      <Modal
        title="Invite New Member"
        open={modalVisible}
        onCancel={() => {
          setUsernameError(null);
          setModalVisible(false);
        }}
        onOk={() => form.submit()}
        okText="Add">
        <Form layout="vertical" form={form} onFinish={handleAddMember}>
          <Form.Item
            name="username"
            label="Username"
            validateStatus={usernameError ? "error" : ""}
            help={usernameError}
            rules={[{ required: true }]}>
            <Input placeholder="Enter Username" />
          </Form.Item>

          <Form.Item name="roles" label="Role" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              options={roleOptions}
              disabled={isGM && !isAdmin && !isSuperAdmin}
              placeholder={
                isGM && !isAdmin && !isSuperAdmin
                  ? "Only 'Individual' is allowed"
                  : ""
              }
            />
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "Onboarded" },
                { value: "Pending" },
                { value: "Deactivated" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        title="Edit Member"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => editForm.submit()}
        okText="Save Changes">
        <Form layout="vertical" form={editForm} onFinish={handleUpdateMember}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roles" label="Role" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              options={roleOptions}
              disabled={isGM && !isAdmin && !isSuperAdmin}
              placeholder={
                isGM && !isAdmin && !isSuperAdmin
                  ? "Only 'Individual' is allowed"
                  : ""
              }
            />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "Onboarded" },
                { value: "Pending" },
                { value: "Deactivated" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Remove Member"
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
        Are you sure you want to remove <strong>{selectedMember?.name}</strong>?
      </Modal>
    </>
  );
};

export default Members;
