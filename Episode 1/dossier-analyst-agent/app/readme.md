# ai-initiative-finder-agent Agent App

This is the app for the AI agent project created by Command.new

## Project Structure
```
├── api/                # API endpoints
├── src/                # React components and utilities
├── public/             # Static assets
├── .env.example        # Environment variables template
├── package.json        # Project dependencies and scripts
├── readme.md           # App readme file
└── vite.config.ts      # Vite configuration for the app
```

## Prerequisites
- Node.js 21 or higher
- npm or pnpm package manager
- Langbase API key

## Getting Started
1. Install dependencies:

```bash
pnpm install
```

2. Fork the agent to your own [Command.new](https://command.new) workspace:

   [Fork this agent on Command.new](https://command.new/arre-ankit76795/dossier-analyst-agent)

   > This will create a copy you control, so you can generate your own API key and customize as needed.

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
```env
# Paste your Langbase API key here (find it in the "API" tab of your forked agent)
LANGBASE_API_KEY=your_langbase_api_key_here

# Your OpenAI API key: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

COMMAND_USER_NAME=""

AGENT_NAME=""
```

## Usage

To run the application, use:

```bash
pnpm dev
```

## Support

For questions or issues, please refer to the [Langbase documentation](https://langbase.com/docs).
