let currentUrl = '';
let currentTitle = '';

async function getStorage(keys) {
  try {
    return await chrome.storage.sync.get(keys);
  } catch {
    return await chrome.storage.local.get(keys);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentUrl = tab?.url || '';
  currentTitle = tab?.title || '';

  document.getElementById('urlPreview').textContent = currentUrl;

  const settings = await getStorage(['promptTemplate', 'defaultHarness', 'customHarnesses']);
  const template = settings.promptTemplate || DEFAULT_PROMPT_TEMPLATE;
  const prompt = template.replace('{url}', currentUrl).replace('{title}', currentTitle);
  document.getElementById('promptInput').value = prompt;

  const allHarnesses = [...HARNESSES, ...(settings.customHarnesses || [])];
  renderHarnesses(allHarnesses, settings.defaultHarness);

  document.getElementById('optionsLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});

function renderHarnesses(harnesses, defaultId) {
  const grid = document.getElementById('harnessGrid');
  grid.innerHTML = '';

  harnesses.forEach((harness) => {
    const btn = document.createElement('button');
    btn.className = `harness-btn${harness.id === defaultId ? ' default' : ''}`;

    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = harness.icon;

    const name = document.createElement('span');
    name.textContent = harness.name;

    btn.appendChild(icon);
    btn.appendChild(name);
    btn.addEventListener('click', () => sendToHarness(harness));
    grid.appendChild(btn);
  });
}

async function sendToHarness(harness) {
  const prompt = document.getElementById('promptInput').value;

  try {
    await navigator.clipboard.writeText(prompt);
  } catch {
    showToast('Failed to copy — check clipboard permissions');
    return;
  }

  if (harness.url) {
    chrome.tabs.create({ url: harness.url });
    showToast('Copied! Paste into ' + harness.name);
    setTimeout(() => window.close(), 800);
  } else {
    showToast('Prompt copied — paste into ' + harness.name);
  }
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
