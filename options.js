async function getStorage(keys) {
  try {
    return await chrome.storage.sync.get(keys);
  } catch {
    return await chrome.storage.local.get(keys);
  }
}

async function setStorage(data) {
  try {
    await chrome.storage.sync.set(data);
  } catch {
    await chrome.storage.local.set(data);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const settings = await getStorage(['promptTemplate', 'defaultHarness']);

  document.getElementById('promptTemplate').value = settings.promptTemplate || DEFAULT_PROMPT_TEMPLATE;
  document.getElementById('defaultHarness').value = settings.defaultHarness || '';
});

document.getElementById('saveBtn').addEventListener('click', async () => {
  await setStorage({
    promptTemplate: document.getElementById('promptTemplate').value,
    defaultHarness: document.getElementById('defaultHarness').value,
  });

  const msg = document.getElementById('savedMsg');
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 2000);
});
