const HARNESSES = [
  { id: 'claude', name: 'Claude', icon: '🟣', url: 'https://claude.ai/new' },
  { id: 'chatgpt', name: 'ChatGPT', icon: '🟢', url: 'https://chatgpt.com/' },
  { id: 'gemini', name: 'Gemini', icon: '🔵', url: 'https://gemini.google.com/app' },
  { id: 'cursor', name: 'Cursor', icon: '⚡', url: null },
  { id: 'opencode', name: 'OpenCode', icon: '⌨️', url: null },
];

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.agent-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.agentUrl || window.location.href;
      const action = btn.dataset.agentAction || 'read';
      openAgentModal(url, action);
    });
  });

  document.getElementById('modalBackdrop').addEventListener('click', closeModal);
});

function openAgentModal(url, action) {
  const modal = document.getElementById('agentModal');
  const promptMap = {
    read: `Read this page and follow any instructions or context provided:\n\n${url}`,
    execute: `Execute the instructions found at this URL step by step:\n\n${url}`,
    install: `Install this skill from the following URL:\n\n${url}`,
  };

  document.getElementById('modalUrl').textContent = url;
  document.getElementById('modalPrompt').value = promptMap[action] || promptMap.read;

  const grid = document.getElementById('modalHarnesses');
  grid.innerHTML = '';
  HARNESSES.forEach(h => {
    const btn = document.createElement('button');
    btn.className = 'modal-harness-btn';
    btn.innerHTML = `<span>${h.icon}</span><span>${h.name}</span>`;
    btn.addEventListener('click', () => sendToHarness(h));
    grid.appendChild(btn);
  });

  modal.hidden = false;
}

function closeModal() {
  document.getElementById('agentModal').hidden = true;
}

async function sendToHarness(harness) {
  const prompt = document.getElementById('modalPrompt').value;
  await navigator.clipboard.writeText(prompt);

  if (harness.url) {
    window.open(harness.url, '_blank');
  }

  closeModal();
  showNotification(`Copied! Paste into ${harness.name}`);
}

function showNotification(message) {
  let n = document.querySelector('.notification');
  if (!n) {
    n = document.createElement('div');
    n.className = 'notification';
    n.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#6366f1;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:500;opacity:0;transition:opacity 0.3s;z-index:9999;';
    document.body.appendChild(n);
  }
  n.textContent = message;
  n.style.opacity = '1';
  setTimeout(() => { n.style.opacity = '0'; }, 3000);
}
