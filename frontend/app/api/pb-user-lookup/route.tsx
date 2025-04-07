import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

const pb = new PocketBase("https://holmz-backend.pockethost.io");

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  console.log(username)

  try {
    const user = await pb
      .collection("users")
      .getFirstListItem(`username="${username}"`);
    console.log(user)
    return NextResponse.json({ found: true, user });
  } catch (err) {
    return NextResponse.json({ found: false }, { status: 404 });
  }
}
