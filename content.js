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

      const settings = await chrome.storage.sync.get(['defaultHarness']);
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

function showHarnessPicker(prompt) {
  let overlay = document.getElementById('agent-opener-overlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'agent-opener-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);font-family:-apple-system,BlinkMacSystemFont,sans-serif;';

  const card = document.createElement('div');
  card.style.cssText = 'background:#1a1a2e;border:1px solid #333;border-radius:12px;padding:20px;width:320px;color:#e0e0e0;';

  const title = document.createElement('h3');
  title.textContent = 'Open in Agent';
  title.style.cssText = 'font-size:15px;margin-bottom:12px;';
  card.appendChild(title);

  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;';

  AGENT_HARNESSES.forEach(h => {
    const btn = document.createElement('button');
    btn.textContent = `${h.icon} ${h.name}`;
    btn.style.cssText = 'padding:10px;border:1px solid #333;border-radius:8px;background:#0f0f23;color:#e0e0e0;font-size:12px;cursor:pointer;transition:border-color 0.15s;';
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(prompt);
        if (h.url) window.open(h.url, '_blank');
        overlay.remove();
        showAgentToast(`Copied! Paste into ${h.name}`);
      } catch {
        showAgentToast('Failed to copy — try Cmd+Shift+A instead');
        overlay.remove();
      }
    });
    btn.addEventListener('mouseenter', () => { btn.style.borderColor = '#6366f1'; });
    btn.addEventListener('mouseleave', () => { btn.style.borderColor = '#333'; });
    grid.appendChild(btn);
  });

  card.appendChild(grid);
  overlay.appendChild(card);

  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  });

  document.body.appendChild(overlay);
}

function showAgentToast(message) {
  let toast = document.getElementById('agent-opener-toast');
  if (toast) toast.remove();

  toast = document.createElement('div');
  toast.id = 'agent-opener-toast';
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#6366f1;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:500;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
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
