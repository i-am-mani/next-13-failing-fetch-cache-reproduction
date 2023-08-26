import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  console.log("This is a log message from the GET method of the route.ts file");

  return NextResponse.json({
    message: "hello world",
    search: req.nextUrl.search,
  });
}
