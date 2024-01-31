import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";

const SPKI = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE0yFanm3yTbCe4Z4KM9yi/IGZf+ugrj+rn82e/guPcFlyLiudyubOWqFFmL/bVdxDY5LFhJdvBwfDYKR8LwcmPg==
-----END PUBLIC KEY-----`;

const allowAnonymous = ["/api/question/public"];

export default async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.includes("/api/")) return NextResponse.next();

  try {
    const verificationKey = await jose.importSPKI(SPKI, "ES256");
    const authToken = req.headers.get("authorization")?.replace("Bearer ", "");

    if (req.nextUrl.pathname.includes("/api/cron/")) {
      // authenticate cron jobs
      if (authToken !== process.env.CRON_SECRET) {
        return new Response("Unauthorized", {
          status: 401
        });
      } else {
        return NextResponse.next();
      }
    }

    if (req.nextUrl.pathname.includes("/api/frame/")) {
      return NextResponse.next();
    }

    const payload = authToken
      ? await jose.jwtVerify(authToken, verificationKey, {
          issuer: "privy.io",
          audience: process.env.PRIVY_APP_ID
        })
      : undefined;

    if (req.nextUrl.pathname.includes("/api/") && !allowAnonymous.find(path => req.nextUrl.pathname.startsWith(path))) {
      if (!payload?.payload.sub) throw new Error("No sub in payload");

      const response = NextResponse.next();
      response.headers.set("privyUserId", payload.payload.sub);
      return response;
    }
  } catch (error) {
    console.error("Error in middleware", error);
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
