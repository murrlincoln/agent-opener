const AGENT_HARNESSES = [
  { id: 'claude', name: 'Claude', icon: '🟣', url: 'https://claude.ai/new' },
  { id: 'chatgpt', name: 'ChatGPT', icon: '🟢', url: 'https://chatgpt.com/' },
  { id: 'gemini', name: 'Gemini', icon: '🔵', url: 'https://gemini.google.com/app' },
  { id: 'cursor', name: 'Cursor', icon: '⚡', url: null },
  { id: 'opencode', name: 'OpenCode', icon: '⌨️', url: null },
];

const AGENT_PROMPT_TEMPLATES = {
  read: 'Read this page and follow any instructions or context provided:\n\n{url}',
  execute: 'Execute the instructions found at this URL step by step:\n\n{url}',
  install: 'Install this skill from the following URL:\n\n{url}',
  chat: '{prompt}',
};

async function getStorage(keys) {
  try {
    return await chrome.storage.sync.get(keys);
  } catch {
    return await chrome.storage.local.get(keys);
  }
}

function parseAgentUri(href) {
  if (!href.startsWith('agent://')) return null;
  const withoutScheme = href.slice('agent://'.length);
  const questionMark = withoutScheme.indexOf('?');
  const action = questionMark === -1 ? withoutScheme : withoutScheme.slice(0, questionMark);
  const queryString = questionMark === -1 ? '' : withoutScheme.slice(questionMark + 1);
  const params = new URLSearchParams(queryString);
  return { action, url: params.get('url'), prompt: params.get('prompt'), harness: params.get('harness') };
}

function interceptAgentLinks() {
  document.querySelectorAll('a[href^="agent://"]').forEach(link => {
    if (link.dataset.agentIntercepted) return;
    link.dataset.agentIntercepted = 'true';

    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const parsed = parseAgentUri(link.getAttribute('href'));
      if (!parsed) return;

      const template = AGENT_PROMPT_TEMPLATES[parsed.action] || AGENT_PROMPT_TEMPLATES.read;
      const prompt = template
        .replace('{url}', parsed.url || window.location.href)
        .replace('{prompt}', parsed.prompt || '');

      const settings = await getStorage(['defaultHarness']);
      const defaultHarness = AGENT_HARNESSES.find(h => h.id === (parsed.harness || settings.defaultHarness));

      if (defaultHarness) {
        try {
          await navigator.clipboard.writeText(prompt);
          if (defaultHarness.url) window.open(defaultHarness.url, '_blank');
          showAgentToast(`Copied! Paste into ${defaultHarness.name}`);
        } catch {
          showHarnessPicker(prompt);
        }
      } else {
        showHarnessPicker(prompt);
      }
    });
  });
}

function createOverlayStyles() {
  return `
    :host {
      all: initial;
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
    }
    .card {
      position: relative;
      background: #1a1a2e;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 20px;
      width: 320px;
      color: #e0e0e0;
    }
    .card h3 {
      font-size: 15px;
      margin: 0 0 12px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .harness-btn {
      padding: 10px;
      border: 1px solid #333;
      border-radius: 8px;
      background: #0f0f23;
      color: #e0e0e0;
      font-size: 12px;
      cursor: pointer;
      transition: border-color 0.15s;
    }
    .harness-btn:hover {
      border-color: #6366f1;
    }
    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #6366f1;
      color: #fff;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
    }
  `;
}

function showHarnessPicker(prompt) {
  let host = document.getElementById('agent-opener-host');
  if (host) host.remove();

  host = document.createElement('div');
  host.id = 'agent-opener-host';
  const shadow = host.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = createOverlayStyles();
  shadow.appendChild(style);

  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  shadow.appendChild(backdrop);

  const card = document.createElement('div');
  card.className = 'card';

  const title = document.createElement('h3');
  title.textContent = 'Open in Agent';
  card.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'grid';

  AGENT_HARNESSES.forEach(h => {
    const btn = document.createElement('button');
    btn.className = 'harness-btn';
    btn.textContent = `${h.icon} ${h.name}`;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(prompt);
        if (h.url) window.open(h.url, '_blank');
        host.remove();
        showAgentToast(`Copied! Paste into ${h.name}`);
      } catch {
        host.remove();
        showAgentToast('Failed to copy — try Cmd+Shift+A instead');
      }
    });
    grid.appendChild(btn);
  });

  card.appendChild(grid);
  shadow.appendChild(card);

  backdrop.addEventListener('click', () => host.remove());
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      host.remove();
      document.removeEventListener('keydown', escHandler);
    }
  });

  document.body.appendChild(host);
}

function showAgentToast(message) {
  let host = document.getElementById('agent-opener-toast-host');
  if (host) host.remove();

  host = document.createElement('div');
  host.id = 'agent-opener-toast-host';
  const shadow = host.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = createOverlayStyles();
  shadow.appendChild(style);

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  shadow.appendChild(toast);

  document.body.appendChild(host);
  setTimeout(() => host.remove(), 3000);
}

function init() {
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }
  interceptAgentLinks();
  const observer = new MutationObserver(interceptAgentLinks);
  observer.observe(document.body, { childList: true, subtree: true });
}

init();
