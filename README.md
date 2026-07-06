# agent:// — Open anything in your AI agent

A browser extension that lets you send any webpage to your AI agent with a single keystroke or click. Also proposes the `agent://` URI protocol for agent-addressable web actions.

## The Problem

You're reading documentation, a tutorial, or a SKILL.md file. You want your AI agent to read it and follow the instructions. Today you have to:

1. Copy the URL
2. Switch to your agent
3. Type "Read this and follow instructions:"
4. Paste the URL
5. Hit enter

**Agent Opener reduces this to one keystroke: `Cmd+Shift+A`**

## How It Works

### For users (the extension)

1. Press **Cmd+Shift+A** (or Ctrl+Shift+A) on any page
2. A popup appears with the URL and an editable prompt
3. Click your preferred agent (Claude, ChatGPT, Gemini, Cursor, OpenCode)
4. The prompt is copied to your clipboard and the agent opens in a new tab
5. Paste and go

### For developers (the protocol)

Add an "Open in Agent" button to any page:

```html
<a href="agent://read?url=https://your-site.com/docs/quickstart">
  ⚡ Open in Agent
</a>
```

The extension intercepts `agent://` links and handles them. Without the extension, links can fall back to a hosted redirect page.

## The `agent://` URI Spec

| URI | Action | Description |
|-----|--------|-------------|
| `agent://read?url=...` | Read | Send a URL for the agent to read and understand |
| `agent://execute?url=...` | Execute | Send instructions the agent should follow step-by-step |
| `agent://install?skill=...` | Install | Install a skill/plugin from a URL |
| `agent://chat?prompt=...` | Chat | Start a conversation with a pre-filled prompt |

Full format:

```
agent://<action>?url=<encoded_url>&prompt=<encoded_prompt>&harness=<preferred_harness>
```

## Install

### From source (developer mode)

1. Clone this repo
2. Open `chrome://extensions` in Chrome/Arc/Brave/Edge
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked** → select the repo root folder
5. Done — you'll see the ⚡ icon in your toolbar

### Keyboard shortcut

The default is **Cmd+Shift+A** (Mac) or **Ctrl+Shift+A** (Windows/Linux).

To change it: `chrome://extensions/shortcuts`

## Configuration

Click the extension icon → **Settings**, or right-click → **Options**.

- **Prompt template** — Customize the default prompt. Use `{url}` and `{title}` as placeholders.
- **Default harness** — Skip the picker and always open in your preferred agent.

## Supported Agents

| Agent | How it works |
|-------|-------------|
| Claude | Opens claude.ai/new + copies prompt |
| ChatGPT | Opens chatgpt.com + copies prompt |
| Gemini | Opens gemini.google.com/app + copies prompt |
| Cursor | Copies prompt (open Cursor manually) |
| OpenCode | Copies prompt (paste into terminal) |

## Architecture

```
Website                          Extension                    Agent
┌─────────────────────┐    ┌──────────────────────┐    ┌──────────────┐
│ <a href="agent://   │───▶│ Content script        │───▶│ Claude       │
│   read?url=...">    │    │ intercepts link       │    │ ChatGPT      │
│                     │    │                       │    │ Gemini       │
│ ─── OR ───          │    │ Popup (Cmd+Shift+A)   │    │ Cursor       │
│                     │    │ reads current tab URL  │    │ OpenCode     │
│ User presses        │───▶│                       │───▶│              │
│ Cmd+Shift+A         │    │ Copies prompt +       │    │              │
└─────────────────────┘    │ opens agent           │    └──────────────┘
                           └──────────────────────┘

Without extension: falls back to hosted redirect page
```

## Demo

Run the demo site locally:

```bash
cd demo && python3 -m http.server 8080
```

- `localhost:8080` — Landing page explaining the concept
- `localhost:8080/sample-skill.html` — Example skill page with "Open in Agent" button

## Why This Matters

There's no `mailto:` equivalent for AI agents. No standard way for a website to say "open this in the user's agent." This extension + protocol proposal fills that gap.

The extension serves as a **polyfill** — once agents natively register `agent://` protocol handlers (trivial for them to implement), the extension becomes unnecessary.

## Permissions

| Permission | Why |
|-----------|-----|
| `activeTab` | Read the URL of the current tab when the popup is opened |
| `tabs` | Query tab info for the popup to display the current page URL |
| `storage` | Save user preferences (default harness, prompt template) |
| Content script on `http://*/*` and `https://*/*` | Intercept `agent://` links on web pages |

The extension does **not** request host permissions, does **not** read page content, and does **not** make network requests. All it does is read the current tab's URL and copy a prompt to your clipboard.

## Known Limitations

- **Address bar navigation**: Typing `agent://read?url=...` directly in the browser address bar won't work. Chrome doesn't allow extensions to register custom protocol handlers for the omnibox. The extension only intercepts `agent://` links within page content.
- **Restricted pages**: The content script cannot run on `chrome://`, `chrome-extension://`, or `file://` pages. Use Cmd+Shift+A (the popup) on those pages instead.
- **Clipboard on strict CSP pages**: Some pages with very restrictive Content Security Policies may block clipboard access from the content script overlay. The extension uses Shadow DOM to isolate its UI, but clipboard still requires a user gesture. Fallback: use Cmd+Shift+A.
- **No native agent:// registration yet**: Until agents (Claude, ChatGPT, Cursor) natively register protocol handlers, the extension is required as a polyfill.

## Contributing

PRs welcome. Key areas:

- Additional agent harness support
- Firefox/Safari ports
- The hosted fallback redirect page (for users without the extension)
- Native `agent://` protocol handler integration when agents support it

## License

MIT
