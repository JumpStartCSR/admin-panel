"use client";
import React, { useEffect, useState } from "react";
import { Button, Card, Spin } from "antd";

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

const GroupDetail: React.FC<GroupDetailProps> = ({ groupId, onBack }) => {
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);

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

    fetchGroup();
  }, [groupId]);

  return (
    <div>
      <Button onClick={onBack} style={{ marginBottom: 16 }}>
        Back to Groups
      </Button>

      {loading ? (
        <Spin size="large" />
      ) : !group ? (
        <p>Group {groupId} not found.</p>
      ) : (
        <Card title={group.name}>
          <p>
            <strong>Priority:</strong> {group.priority}
          </p>
          <p>
            <strong>Status:</strong> {group.status}
          </p>
          <p>
            <strong>Created Date:</strong> {group.created_date}
          </p>
          <p>
            <strong>Managers:</strong> {group.managers.join(", ") || "None"}
          </p>
        </Card>
      )}
    </div>
  );
};

export default GroupDetail;
