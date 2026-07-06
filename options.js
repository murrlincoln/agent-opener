const DEFAULT_PROMPT_TEMPLATE = 'Read this page and follow any instructions or context provided:\n\n{url}';

document.addEventListener('DOMContentLoaded', async () => {
  const settings = await chrome.storage.sync.get(['promptTemplate', 'defaultHarness']);

  document.getElementById('promptTemplate').value = settings.promptTemplate || DEFAULT_PROMPT_TEMPLATE;
  document.getElementById('defaultHarness').value = settings.defaultHarness || '';
});

document.getElementById('saveBtn').addEventListener('click', async () => {
  await chrome.storage.sync.set({
    promptTemplate: document.getElementById('promptTemplate').value,
    defaultHarness: document.getElementById('defaultHarness').value,
  });

  const msg = document.getElementById('savedMsg');
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 2000);
});
