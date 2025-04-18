"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Tabs,
  Input,
  Dropdown,
  Menu,
  Checkbox,
  Table,
  Space,
  Spin,
  Modal,
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
import { useOrganization } from "@/app/context/org-context";

interface GroupDetailProps {
  groupId: string;
  onBack: () => void;
}

interface GroupData {
  name: string;
  description: string;
  priority: string;
  status: string;
  created_date: string;
  managers: string[];
}

interface MemberData {
  key: string;
  name: string;
  status: string;
  role: string;
}

const GroupDetail: React.FC<GroupDetailProps> = ({ groupId, onBack }) => {
  const [group, setGroup] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [orgMembers, setOrgMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MemberData | null>(null);
  const [inviteSelection, setInviteSelection] = useState<string[]>([]);
  const [inviteRole, setInviteRole] = useState<"GM" | "Individual">(
    "Individual"
  );
  const [editRole, setEditRole] = useState<"GM" | "Individual">("Individual");
  const [messageApi, contextHolder] = message.useMessage();
  const { organizationId } = useOrganization();

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetch(`/api/groups/${groupId}`);
        const data = await res.json();
        setGroup(data);
      } catch (err) {
        console.error("Failed to fetch group details", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/groups/${groupId}/members`);
        const data = await res.json()
        setMembers(data);
      } catch (err) {
        console.error("Failed to fetch group members", err);
      }
    };

    const fetchOrgMembers = async () => {
      try {
        const res = await fetch(
          `/api/members?organizationId=${organizationId}`
        );
        const data = await res.json();
        setOrgMembers(data);
      } catch (err) {
        console.error("Failed to fetch organization members", err);
      }
    };

    fetchGroup();
    fetchMembers();
    fetchOrgMembers();
  }, [groupId]);

  const refreshMembers = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error("Failed to refresh members", err);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
    setSelectedRoles([]);
  };

  const filteredMembers = members.filter((item) => {
    const matchSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
    const matchRole =
      selectedRoles.length === 0 || selectedRoles.includes(item.role);
    return matchSearch && matchStatus && matchRole;
  });

  const handleInviteSubmit = async () => {
    const existingIds = members.map((m) => m.key);
    const newIds = inviteSelection.filter((id) => !existingIds.includes(id));
    if (newIds.length === 0) {
      messageApi.warning("All selected users are already in the group.");
      return;
    }

    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: newIds, role: inviteRole }),
      });

      if (res.ok) {
        messageApi.success("Members invited successfully");
        setInviteModalVisible(false);
        setInviteSelection([]);
        setInviteRole("Individual");
        await refreshMembers();
      } else {
        const error = await res.json();
        messageApi.error(error.error || "Failed to invite members.");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("Unexpected error occurred");
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(
        `/api/groups/${groupId}/members/${selectedUser.key}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: editRole }),
        }
      );

      if (res.ok) {
        messageApi.success("Member role updated");
        setEditModalVisible(false);
        setSelectedUser(null);
        await refreshMembers();
      } else {
        const error = await res.json();
        messageApi.error(error.error || "Failed to update role.");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("Unexpected error occurred");
    }
  };

  const handleRemove = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(
        `/api/groups/${groupId}/members/${selectedUser.key}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        messageApi.success("Member removed from group");
        setDeleteModalVisible(false);
        setSelectedUser(null);
        await refreshMembers();
      } else {
        const error = await res.json();
        messageApi.error(error.error || "Failed to remove member.");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("Unexpected error occurred");
    }
  };

  const columns: TableProps<MemberData>["columns"] = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Controls",
      key: "controls",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setSelectedUser(record);
              setEditRole(record.role as "GM" | "Individual");
              setEditModalVisible(true);
            }}>
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              setSelectedUser(record);
              setDeleteModalVisible(true);
            }}>
            Remove
          </Button>
        </Space>
      ),
    },
  ];

  const inviteOptions = orgMembers.map((m) => ({
    label: m.name,
    value: m.key,
  }));

  return (
    <div>
      {contextHolder}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button onClick={onBack}>← Back</Button>
          <h2 className="text-xl font-semibold">{group?.name}</h2>
        </div>
        <Button
          icon={<PlusOutlined />}
          onClick={() => setInviteModalVisible(true)}>
          Invite
        </Button>
      </div>

      <Tabs
        defaultActiveKey="members"
        items={[{ key: "members", label: "Members" }]}
      />

      <div className="flex gap-8">
        <div style={{ flex: 1 }}>
          <div className="flex items-center mb-4 gap-2">
            <Input
              placeholder="Search Members"
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: 300 }}
            />
            <Dropdown
              overlay={
                <Menu>
                  {["GM", "Individual"].map((role) => (
                    <Menu.Item
                      key={role}
                      onClick={() =>
                        setSelectedRoles((prev) =>
                          prev.includes(role)
                            ? prev.filter((r) => r !== role)
                            : [...prev, role]
                        )
                      }>
                      <Checkbox checked={selectedRoles.includes(role)}>
                        {role === "GM" ? "Group Manager" : "Individual"}
                      </Checkbox>
                    </Menu.Item>
                  ))}
                </Menu>
              }>
              <Button type="text">
                Role <DownOutlined />
              </Button>
            </Dropdown>
            <Button type="text" onClick={clearFilters} icon={<CloseOutlined />}>
              Clear Filters
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={filteredMembers}
            rowKey="key"
            pagination={false}
          />
        </div>

        <div style={{ width: 320 }}>
          <Card title="Properties">
            <p>
              <strong>Name:</strong> {group?.name}
            </p>
            <p>
              <strong>Manager:</strong> {group?.managers.join(", ") || "None"}
            </p>
            <p>
              <strong>Priority:</strong> {group?.priority}
            </p>
            <p>
              <strong>Status:</strong> {group?.status}
            </p>
            <p>
              <strong>Created Date:</strong> {group?.created_date}
            </p>
          </Card>
        </div>
      </div>

      <Modal
        open={inviteModalVisible}
        title="Invite Members to Group"
        onCancel={() => setInviteModalVisible(false)}
        onOk={handleInviteSubmit}
        okText="Invite">
        <label>Select Members</label>
        <Select
          mode="multiple"
          allowClear
          showSearch
          value={inviteSelection}
          onChange={(val) => setInviteSelection(val)}
          placeholder="Search and select members"
          style={{ width: "100%", marginBottom: 16 }}
          options={inviteOptions}
          optionFilterProp="label"
          suffixIcon={<SearchOutlined />}
        />
        <label>Assign Role</label>
        <Select
          style={{ width: "100%" }}
          value={inviteRole}
          onChange={(val) => setInviteRole(val)}
          options={[
            { value: "GM", label: "Group Manager" },
            { value: "Individual", label: "Individual" },
          ]}
        />
      </Modal>

      <Modal
        open={editModalVisible}
        title="Edit Member Role"
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
        okText="Update">
        <label>Update Role</label>
        <Select
          style={{ width: "100%" }}
          value={editRole}
          onChange={(val) => setEditRole(val)}
          options={[
            { value: "GM", label: "Group Manager" },
            { value: "Individual", label: "Individual" },
          ]}
        />
      </Modal>

      <Modal
        open={deleteModalVisible}
        title="Remove Member"
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleRemove}
        okText="Remove"
        okButtonProps={{ danger: true }}>
        Are you sure you want to remove <strong>{selectedUser?.name}</strong>{" "}
        from the group?
      </Modal>
    </div>
  );
};

export default GroupDetail;
