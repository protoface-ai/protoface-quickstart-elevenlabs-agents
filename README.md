# Protoface Quickstart for Eleven Labs Conversational AI

This quickstart is an example of how to create a Protoface Avatar that runs in a Next.js app with the Protoface Node plugin and Eleven Labs Conversational AI. 

## About Protoface

Protoface adds a real-time avatar to your AI app or agent.

Get a **free** API key at [protoface.com](https://protoface.com/?utm_source=github&utm_medium=referral&utm_campaign=github_docs&utm_content=protoface-quickstart-elevenlabs).

Read the docs at [docs.protoface.com](https://docs.protoface.com/?utm_source=github&utm_medium=referral&utm_campaign=github_docs&utm_content=protoface-quickstart-elevenlabs).

To see quickstarts for other platforms, visit the [quickstart repo](https://github.com/protoface-ai/protoface-quickstart).

## Usage

1. Rename `.env.example` to `.env` and paste your Protoface API key, your LiveKit secrets, and your ElevenLabs API key and agent id.

```js
PROTOFACE_API_KEY="PROTOFACE-API-KEY"
LIVEKIT_URL="wss://YOUR-LIVEKIT-PROJECT.livekit.cloud"
LIVEKIT_API_KEY="LIVEKIT-API-KEY"
LIVEKIT_API_SECRET="LIVEKIT-API-SECRET"

NEXT_PUBLIC_ELEVENLABS_AGENT_ID="ELEVENLABS-AGENT-ID"
NEXT_PUBLIC_PROTOFACE_AVATAR_ID="av_stock_001" // Optional (defaults to av_stock_001)
```

2. Install packages.

```bash
npm install
```

3. Run.

```bash
npm run dev
```

## How It Works

The app starts an ElevenLabs conversation and a Protoface avatar session side by side:

1. The server route creates a Protoface session and returns the browser connection details.
2. `ProtofaceClient.start()` connects the browser to the avatar session.
3. The ElevenLabs React SDK starts the agent conversation.
4. The app passes the agent's realtime speech to Protoface so the avatar speaks naturally.

Protoface is the visible and audible avatar output for the experience.

## Characters

You can swap out the character by finding one that you like in the [Protoface avatar docs](https://docs.protoface.com/guides/avatars?utm_source=github&utm_medium=referral&utm_campaign=github_docs&utm_content=protoface-quickstart-vapi), or create your own.

`av_stock_001` `av_stock_002` `av_stock_003` `custom_avatar_id`

## Deploy on Vercel

Deploy with the Vercel Platform and set the same environment variables in Project Settings.
