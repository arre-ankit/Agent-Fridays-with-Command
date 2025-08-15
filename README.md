# Agent Fridays with Command 🚀

This is the official codebase for my weekly series **Agent Fridays with Command.new**, where I take AI agent ideas from the internet, build them in real time, and open source everything — so you can learn, test, and ship your own agents.

## 📁 Project Structure Overview

Under the each Episode folder:

1. Prompts Folder (prompts/)
This folder contains ready-to-use prompts for each AI agent, so you can copy-paste them directly into [Command.new](https://command.new) and get started instantly.

2. Agent Implementation Folders
Each agent has its own folder with:

```
agent-name/
├── agent.ts                # Main workflow implementation using Langbase
│                           # This is the core agent logic you can use anywhere
│                           # (integrate into other apps, run standalone, etc.)
├── app/                    # React-based UI application
│   ├── api/               # Server-side API endpoints
│   ├── src/               # Client-side React components
│   ├── package.json       # App dependencies and scripts
│   └── vite.config.js     # Vite configuration
├── package.json           # Agent dependencies and scripts
├── readme.md              # Detailed setup instructions
└── .env.example           # Environment variable templates
```

**Key Components:**

- **`agent.ts`** — The core agent logic built with Langbase workflows. This is the main implementation that you can:
  - Run standalone with `pnpm run agent`
  - Integrate into other applications

- **`app/`** — A complete React application that calls your forked Command.new agent via API:
  - **Server**: API endpoints in `app/api/` that communicate with your Command.new agent
  - **Client**: Modern React UI with Tailwind CSS components
  - **Setup**: Requires your Command.new username and agent name in environment variables
  - **Run**: Just execute `pnpm run dev` with correct env variables


## 🛠 How to Setup Locally

1. Clone the repo
2. Follow the setup instructions in each agent's folder
3. Add your API keys (stored in `.env`)
4. Run locally 

## 🎯 Agents So Far

- **[Dossier Analyst](/Episode%201/dossier-analyst-agent/)** — Deep research on any person
- **[Company AI Initiative Finder](/Episode%201/ai-initiative-finder-agent/)** — Track AI moves from any company over time
- **[Chat with PDF](/Episode%201/chat-with-pdf/)** — Conversational interface for any document
- *(More added every Friday)*

## 💡 Contributing

Got an idea for an agent? Open an issue! The most requested ideas will be built in future episodes.

> **Want to contribute directly?**  
> Feel free to open an issue to discuss your idea, and if you're ready, submit a pull request (PR) with your changes. We welcome contributions from everyone!
