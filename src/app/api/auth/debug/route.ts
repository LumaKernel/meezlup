import { type NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(request: NextRequest) {
  try {
    console.log("[Debug] Checking session...");
    const session = await auth0.getSession(request);

    if (!session) {
      console.log("[Debug] No session found");
      return NextResponse.json({
        authenticated: false,
        message: "No session found",
      });
    }

    console.log("[Debug] Session found:", {
      user: session.user.sub,
      email: session.user.email,
      expires: session.expires,
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.sub,
        email: session.user.email,
        name: session.user.name,
        picture: session.user.picture,
        nickname: session.user.nickname,
        emailVerified: session.user.email_verified,
      },
      expires: session.expires,
    });
  } catch (error) {
    console.error("[Debug] Error checking session:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
