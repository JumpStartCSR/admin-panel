"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  DatePicker,
  Space,
  message,
} from "antd";
import { PlusOutlined, SearchOutlined, CloseOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import dayjs from "dayjs";

interface OrganizationDataType {
  key: string;
  name: string;
  startDate: string;
  endDate?: string;
}

const Organizations: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationDataType | null>(
    null
  );
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [data, setData] = useState<OrganizationDataType[]>([]);

  // Fetch organizations
  const fetchOrganizations = async () => {
    const res = await fetch("/api/organizations");
    const orgs = await res.json();
    setData(orgs);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleAddOrganization = async (values: any) => {
    const res = await fetch("/api/organizations", {
      method: "POST",
      body: JSON.stringify({
        name: values.name,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      form.resetFields();
      setModalVisible(false);
      fetchOrganizations();
    } else {
      message.error("Failed to add organization.");
    }
  };

  const handleEdit = (record: OrganizationDataType) => {
    setSelectedOrg(record);
    editForm.setFieldsValue({
      name: record.name,
      startDate: dayjs(record.startDate, "DD MMM, YYYY"),
      endDate: record.endDate ? dayjs(record.endDate, "DD MMM, YYYY") : null,
    });
    setEditModalVisible(true);
  };

  const handleUpdateOrganization = async (values: any) => {
    if (!selectedOrg) return;

    const res = await fetch(`/api/organizations/${selectedOrg.key}`, {
      method: "PUT",
      body: JSON.stringify({
        name: values.name,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setEditModalVisible(false);
      fetchOrganizations();
    } else {
      message.error("Failed to update organization.");
    }
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;

    const res = await fetch(`/api/organizations/${selectedOrg.key}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setDeleteModalVisible(false);
      fetchOrganizations();
    } else {
      message.error("Failed to delete organization.");
    }
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: TableProps<OrganizationDataType>["columns"] = [
    { title: "Organization/Client Name", dataIndex: "name", key: "name" },
    { title: "Contract Start Date", dataIndex: "startDate", key: "startDate" },
    { title: "Contract End Date", dataIndex: "endDate", key: "endDate" },
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
              setSelectedOrg(record);
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
        <h2>Manage Organizations</h2>
        <Button icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Add Organization
        </Button>
      </div>

      <div className="flex items-center mb-4 gap-2">
        <Input
          placeholder="Search Organizations"
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <Button
          type="text"
          onClick={() => setSearchQuery("")}
          icon={<CloseOutlined />}>
          Clear
        </Button>
      </div>

      <Table<OrganizationDataType>
        columns={columns}
        dataSource={filteredData}
        rowKey="key"
      />

      {/* Add Modal */}
      <Modal
        title="Add New Organization"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="Add Organization">
        <Form layout="vertical" form={form} onFinish={handleAddOrganization}>
          <Form.Item
            label="Organization/Client Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name" }]}>
            <Input placeholder="e.g. Seattle General Hospital" />
          </Form.Item>
          <Form.Item
            label="Contract Start Date"
            name="startDate"
            rules={[{ required: true, message: "Please select a start date" }]}>
            <DatePicker format="DD MMM, YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Contract End Date" name="endDate">
            <DatePicker format="DD MMM, YYYY" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Organization"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => editForm.submit()}
        okText="Save Changes">
        <Form
          layout="vertical"
          form={editForm}
          onFinish={handleUpdateOrganization}>
          <Form.Item
            label="Organization/Client Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Contract Start Date"
            name="startDate"
            rules={[{ required: true, message: "Please select a start date" }]}>
            <DatePicker format="DD MMM, YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Contract End Date" name="endDate">
            <DatePicker format="DD MMM, YYYY" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Remove Organization"
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
        Are you sure you want to remove <strong>{selectedOrg?.name}</strong>?
      </Modal>
    </>
  );
};

export default Organizations;
