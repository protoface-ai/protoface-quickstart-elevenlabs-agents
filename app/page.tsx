"use client";

import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { ProtofaceClient } from "protoface-client";
import { useRef, useState } from "react";

type SessionState = "idle" | "starting" | "connected" | "disconnecting" | "disconnected" | "error";

const avatar = {
  protoface_avatarid: process.env.NEXT_PUBLIC_PROTOFACE_AVATAR_ID || "av_stock_001",
  elevenlabs_agentid: requirePublicEnv(
    "NEXT_PUBLIC_ELEVENLABS_AGENT_ID",
    process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
  )
};

interface ProtofaceConnectionResponse {
  sessionToken: string;
  livekitUrl: string;
  roomName: string;
  participantToken: string;
  sessionId?: string;
  avatarId?: string;
  avatarIdentity?: string;
}

export default function Home() {
  return (
    <ConversationProvider>
      <AgentAvatar />
    </ConversationProvider>
  );
}

function AgentAvatar() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const clientRef = useRef<ProtofaceClient | null>(null);
  const cleanupPromiseRef = useRef<Promise<void> | null>(null);
  const [status, setStatus] = useState<SessionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([]);

  const conversation = useConversation({
    volume: 0,
    format: "pcm",
    sampleRate: 16000,
    onAudio: (base64Audio) => {
      if (clientRef.current?.status === "started") {
        void clientRef.current.sendAudioData(base64ToUint8Array(base64Audio));
      }
    },
    onModeChange: ({ mode }) => {
      if (mode === "listening" && clientRef.current?.status === "started") {
        void clientRef.current.clearBuffer();
      }
    },
    onError: (message) => {
      setError(message);
      pushEvent(`ElevenLabs error: ${message}`);
      void endSession("error");
    },
    onConnect: () => {
      setStatus("connected");
      pushEvent("ElevenLabs connected.");
    },
    onDisconnect: () => {
      pushEvent("ElevenLabs disconnected.");
      void endSession("disconnected");
    }
  });

  const isRunning = status === "starting" || status === "connected" || status === "disconnecting";
  const canDisconnect = status === "starting" || status === "connected";

  async function start() {
    if (isRunning) {
      return;
    }

    try {
      setStatus("starting");
      setError(null);
      setEvents([]);

      const connection = await createProtofaceConnection(avatar.protoface_avatarid);
      const client = new ProtofaceClient({
        avatarId: connection.avatarId ?? avatar.protoface_avatarid,
        livekitUrl: connection.livekitUrl,
        roomName: connection.roomName,
        participantToken: connection.participantToken,
        workerToken: "server-created",
        workerIdentity: connection.avatarIdentity,
        videoElement: videoRef.current,
        audioElement: audioRef.current,
        apiClient: createBrowserSessionApi(connection)
      });

      client.on("start", () => pushEvent("Protoface started."));
      client.on("error", ({ error: protofaceError }) => {
        setError(protofaceError.message);
        pushEvent(`Protoface error: ${protofaceError.message}`);
        void endSession("error");
      });
      client.on("speaking", () => pushEvent("Protoface is speaking."));
      client.on("silent", () => pushEvent("Protoface is ready."));

      await client.start();
      clientRef.current = client;
      conversation.startSession({
        agentId: avatar.elevenlabs_agentid,
        connectionType: "websocket",
        format: "pcm",
        sampleRate: 16000
      });
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Failed to start.");
      await endSession("error");
    }
  }

  async function stop() {
    await endSession("disconnected");
    pushEvent("Session stopped.");
  }

  async function endSession(nextState: "disconnected" | "error") {
    if (cleanupPromiseRef.current) {
      await cleanupPromiseRef.current;
      return;
    }

    setStatus("disconnecting");
    cleanupPromiseRef.current = cleanupSession();
    await cleanupPromiseRef.current;
    cleanupPromiseRef.current = null;
    setStatus(nextState);
  }

  async function cleanupSession() {
    conversation.endSession();
    await clientRef.current?.stop();
    clientRef.current = null;
  }

  function pushEvent(message: string) {
    setEvents((current) => [message, ...current].slice(0, 8));
  }

  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="https://protoface.com" target="_blank" rel="noreferrer">
          Protoface
        </a>
        <nav className="navLinks" aria-label="Starter links">
          <a href="https://docs.protoface.com" target="_blank" rel="noreferrer">Docs</a>
          <a href="https://elevenlabs.io/docs/agents-platform/overview" target="_blank" rel="noreferrer">ElevenLabs</a>
          <a href="https://app.protoface.com" target="_blank" rel="noreferrer">Login</a>
        </nav>
      </header>

      <div className="shell">
        <section className="stage">
          {status !== "connected" ? (
            <div className="stagePreview">
              <p className="eyebrow">Protoface preview</p>
              <h2>Your avatar will appear here once the conversation starts.</h2>
              <p>Start a session to test your ElevenLabs agent with a realtime Protoface avatar.</p>
            </div>
          ) : null}
          <video ref={videoRef} autoPlay playsInline />
          <audio ref={audioRef} autoPlay />
        </section>

        <aside className="controls">
          <section className="intro">
            <h1>Realtime avatars for AI.</h1>
            <p>Add a realtime Protoface avatar to your ElevenLabs Conversational AI agent. Start a session to try the full conversation flow.</p>
          </section>

          <section className="status">
            <div className="buttonRow">
              <button className="button" type="button" onClick={start} disabled={isRunning}>
                {status === "starting" ? "Starting" : "Start conversation"}
              </button>
              <button className="button secondary" type="button" onClick={stop} disabled={!canDisconnect}>
                End conversation
              </button>
            </div>

            <div className="statusList">
              <div className="statusItem">
                <strong>Session</strong>
                <span className="pill">{formatStatusLabel(status)}</span>
              </div>
              <div className="statusItem">
                <strong>ElevenLabs</strong>
                <span className="pill">{formatStatusLabel(conversation.status)}</span>
              </div>
              <div className="statusItem">
                <strong>Mode</strong>
                <span className="pill">{formatStatusLabel(conversation.mode)}</span>
              </div>
              <div className="statusItem">
                <strong>Protoface avatar</strong>
                <span className="pill">{avatar.protoface_avatarid}</span>
              </div>
              <div className="statusItem">
                <strong>ElevenLabs agent</strong>
                <span className="pill">{shortId(avatar.elevenlabs_agentid)}</span>
              </div>
            </div>

            {error ? <p className="error">{error}</p> : null}
          </section>

          <section className="log">
            <h2>Events</h2>
            <ul className="logList">
              {events.length > 0 ? (
                events.map((event, index) => <li key={`${event}-${index}`}>{event}</li>)
              ) : (
                <li>Ready when you are.</li>
              )}
            </ul>
          </section>

          <section className="quickStart">
            <h2>Quick start</h2>
            <ol>
              <li>Add keys to `.env`.</li>
              <li>Create an ElevenLabs Conversational AI agent.</li>
              <li>Set the avatar ID you want to preview.</li>
            </ol>
          </section>
        </aside>
      </div>
    </main>
  );
}

async function createProtofaceConnection(avatarId: string): Promise<ProtofaceConnectionResponse> {
  const response = await fetch("/api/protoface/session-token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ avatarId })
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Failed to create Protoface session.");
  }
  return payload;
}

function createBrowserSessionApi(connection: ProtofaceConnectionResponse) {
  return {
    async createLiveKitSession() {
      return {
        id: connection.sessionId ?? connection.sessionToken,
        status: "running" as const,
        avatar_id: connection.avatarId ?? avatar.protoface_avatarid,
        transport: {
          type: "livekit" as const,
          url: connection.livekitUrl,
          room_name: connection.roomName,
          audio_source: "data_stream" as const,
          worker_identity: connection.avatarIdentity
        },
        quality: "standard",
        max_duration_seconds: 600,
        idle_timeout_seconds: 180,
        metadata: {},
        created_at: new Date().toISOString()
      };
    },
    async endSession(sessionId: string) {
      await fetch("/api/protoface/session-token", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
    }
  };
}

function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function requirePublicEnv(name: string, value: string | undefined) {
  if (!value || value.includes("-ID")) {
    throw new Error(`Missing ${name}.`);
  }
  return value;
}

function shortId(value: string) {
  if (!value) {
    return "Not set";
  }
  return value.length > 16 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
}

function formatStatusLabel(value: string | null | undefined) {
  if (!value) {
    return "Not started";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
