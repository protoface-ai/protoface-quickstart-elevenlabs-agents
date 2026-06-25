# Create Protoface App (ElevenLabs Conversational AI)

This starter adds a realtime Protoface avatar to an ElevenLabs Conversational AI agent in a Next.js app.

## About Protoface

Protoface adds a real-time avatar to your AI app or agent.

Get a **free** API key at [protoface.com](https://protoface.com/?utm_source=github&utm_medium=referral&utm_campaign=github_docs&utm_content=protoface-quickstart-elevenlabs).

Read the docs at [docs.protoface.com](https://docs.protoface.com/?utm_source=github&utm_medium=referral&utm_campaign=github_docs&utm_content=protoface-quickstart-elevenlabs).

To see quickstarts for other platforms, visit the [quickstart repo](https://github.com/protoface-ai/protoface-quickstart).

## Usage

1. Rename `.env.example` to `.env` and paste your Protoface, LiveKit, and ElevenLabs agent values.

```js
PROTOFACE_API_KEY="PROTOFACE-API-KEY"
LIVEKIT_URL="wss://YOUR-LIVEKIT-PROJECT.livekit.cloud"
LIVEKIT_API_KEY="LIVEKIT-API-KEY"
LIVEKIT_API_SECRET="LIVEKIT-API-SECRET"

NEXT_PUBLIC_ELEVENLABS_AGENT_ID="ELEVENLABS-AGENT-ID"
NEXT_PUBLIC_PROTOFACE_AVATAR_ID="av_stock_001"
```

2. Install packages.

```bash
npm install
```

3. Run.

```bash
npm run dev
```

4. Set the ElevenLabs agent ID in `.env`. `NEXT_PUBLIC_PROTOFACE_AVATAR_ID` is optional and defaults to `av_stock_001`.

```js
NEXT_PUBLIC_ELEVENLABS_AGENT_ID="ELEVENLABS-AGENT-ID"
NEXT_PUBLIC_PROTOFACE_AVATAR_ID="av_stock_001"
```

## How It Works

The app starts an ElevenLabs conversation and a Protoface avatar session side by side:

1. The server route creates a Protoface session and returns the browser connection details.
2. `ProtofaceClient.start()` connects the browser to the avatar session.
3. The ElevenLabs React SDK starts the agent conversation.
4. The app passes the agent's realtime speech to Protoface so the avatar speaks naturally.

Protoface is the visible and audible avatar output for the experience.

## Deploy on Vercel

Deploy with the Vercel Platform and set the same environment variables in Project Settings.
