import { type NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(request: NextRequest) {
  try {
    return await auth0.middleware(request);
  } catch (error) {
    console.error("Auth0 API route error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 },
    );
  }
}
