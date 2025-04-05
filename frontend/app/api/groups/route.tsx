// app/api/groups/route.ts
import { NextResponse } from "next/server";

let mockGroups = [
  {
    groupID: 1,
    name: "VA Pilot Group",
    managers: [1],
    department: "VA - General",
    members: 45,
    priority: "High",
    status: "Active",
    createdDate: "11 Nov, 2024",
    lastActive: "11 minutes ago",
  },
  {
    groupID: 2,
    name: "Physical Therapy A",
    managers: [2],
    department: "VA - Health Dept",
    members: 12,
    priority: "High",
    status: "Active",
    createdDate: "15 Nov, 2024",
    lastActive: "2 hours ago",
  },
];

let currentID = 3;

export async function GET() {
  return NextResponse.json(mockGroups);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newGroup = {
    ...body,
    groupID: currentID++,
    createdDate: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    lastActive: "Just now",
    members: 0,
  };
  mockGroups.push(newGroup);
  return NextResponse.json(newGroup, { status: 201 });
}
