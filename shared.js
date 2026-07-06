const HARNESSES = [
  { id: 'claude', name: 'Claude', icon: '🟣', url: 'https://claude.ai/new' },
  { id: 'chatgpt', name: 'ChatGPT', icon: '🟢', url: 'https://chatgpt.com/' },
  { id: 'gemini', name: 'Gemini', icon: '🔵', url: 'https://gemini.google.com/app' },
  { id: 'cursor', name: 'Cursor', icon: '⚡', url: null },
  { id: 'opencode', name: 'OpenCode', icon: '⌨️', url: null },
];

const PROMPT_TEMPLATES = {
  read: 'Read this page and follow any instructions or context provided:\n\n{url}',
  execute: 'Execute the instructions found at this URL step by step:\n\n{url}',
  install: 'Install this skill from the following URL:\n\n{url}',
  chat: '{prompt}',
};

const DEFAULT_PROMPT_TEMPLATE = PROMPT_TEMPLATES.read;
