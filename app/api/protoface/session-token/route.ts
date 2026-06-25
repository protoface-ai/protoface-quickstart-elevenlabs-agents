import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { ProtofaceApiClient } from "protoface-client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { avatarId } = (await request.json()) as { avatarId?: string };
    if (!avatarId) {
      throw new Error("Missing avatarId.");
    }

    const livekitUrl = requireEnv("LIVEKIT_URL");
    const livekitApiKey = requireEnv("LIVEKIT_API_KEY");
    const livekitApiSecret = requireEnv("LIVEKIT_API_SECRET");
    const roomName = `protoface-elevenlabs-${crypto.randomUUID()}`;
    const workerIdentity = "protoface-avatar-agent";

    const [participantToken, workerToken] = await Promise.all([
      createLiveKitToken(livekitApiKey, livekitApiSecret, `viewer-${crypto.randomUUID()}`, roomName, false),
      createLiveKitToken(livekitApiKey, livekitApiSecret, workerIdentity, roomName, true)
    ]);

    const protoface = new ProtofaceApiClient({ apiKey: requireEnv("PROTOFACE_API_KEY") });
    const session = await protoface.createLiveKitSession({
      avatarId,
      livekitUrl,
      roomName,
      workerToken,
      workerIdentity,
      maxDurationSeconds: 600,
      idleTimeoutSeconds: 180,
      metadata: { example: "create-protoface-app-elevenlabs" }
    });

    return NextResponse.json({
      sessionToken: session.id,
      livekitUrl,
      roomName,
      participantToken,
      sessionId: session.id,
      avatarId,
      avatarIdentity: workerIdentity
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create session.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { sessionId } = (await request.json()) as { sessionId?: string };
    if (!sessionId) {
      throw new Error("Missing sessionId.");
    }
    await new ProtofaceApiClient({ apiKey: requireEnv("PROTOFACE_API_KEY") }).endSession(sessionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to end session.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function createLiveKitToken(
  apiKey: string,
  apiSecret: string,
  identity: string,
  roomName: string,
  canPublish: boolean
) {
  const token = new AccessToken(apiKey, apiSecret, { identity, ttl: "10m" });
  token.addGrant({ room: roomName, roomJoin: true, canPublish, canSubscribe: true, canPublishData: true });
  return token.toJwt();
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}.`);
  }
  return value;
}
