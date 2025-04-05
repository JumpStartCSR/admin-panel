// app/api/groups/[id]/route.ts
import { NextResponse } from "next/server";

let mockGroups = globalThis.mockGroups ?? [];

globalThis.mockGroups = mockGroups;

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const updated = await req.json();
  const groupID = Number(params.id);
  const index = mockGroups.findIndex((g) => g.groupID === groupID);

  if (index === -1) {
    return NextResponse.json({ message: "Group not found" }, { status: 404 });
  }

  mockGroups[index] = { ...mockGroups[index], ...updated };
  return NextResponse.json(mockGroups[index]);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const groupID = Number(params.id);
  mockGroups = mockGroups.filter((g) => g.groupID !== groupID);
  globalThis.mockGroups = mockGroups;
  return new NextResponse(null, { status: 204 });
}
