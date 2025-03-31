"use client";
import React, { useState } from "react";
import { Table, Button, Input, Modal, Form, DatePicker, Space } from "antd";
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

  const [data, setData] = useState<OrganizationDataType[]>([
    {
      key: "1",
      name: "Seattle General Hospital",
      startDate: "01 Jan, 2024",
      endDate: "01 Jan, 2025",
    },
    {
      key: "2",
      name: "Mercy Health Center",
      startDate: "15 Mar, 2023",
      endDate: "",
    },
  ]);

  const handleAddOrganization = (values: any) => {
    const newEntry: OrganizationDataType = {
      key: String(Date.now()),
      name: values.name,
      startDate: values.startDate.format("DD MMM, YYYY"),
      endDate: values.endDate ? values.endDate.format("DD MMM, YYYY") : "",
    };
    setData([...data, newEntry]);
    setModalVisible(false);
    form.resetFields();
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

  const handleUpdateOrganization = (values: any) => {
    const updated = data.map((org) =>
      org.key === selectedOrg?.key
        ? {
            ...org,
            name: values.name,
            startDate: values.startDate.format("DD MMM, YYYY"),
            endDate: values.endDate
              ? values.endDate.format("DD MMM, YYYY")
              : "",
          }
        : org
    );
    setData(updated);
    setEditModalVisible(false);
  };

  const handleDelete = () => {
    setData(data.filter((org) => org.key !== selectedOrg?.key));
    setDeleteModalVisible(false);
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
        <div className="gap-2 flex">
          <Button icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            Add Organization
          </Button>
        </div>
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

      {/* Delete Confirmation Modal */}
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
