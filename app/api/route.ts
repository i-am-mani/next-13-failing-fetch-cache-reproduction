import { NextResponse } from "next/server";

export function GET() {
  console.log("This is a log message from the GET method of the route.ts file");

  return NextResponse.json({ message: "hello world" });
}
