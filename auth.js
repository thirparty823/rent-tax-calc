const AUTH_CONFIG = {
  storageKey: 'rent_tax_tool_auth',
  monthPasswords: {
    '2026-03': 'test',
    '2026-04': '',
    '2026-05': ''
  }
};

function getCurrentMonthKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function getExpectedPassword() {
  const key = getCurrentMonthKey();
  return AUTH_CONFIG.monthPasswords[key] || null;
}

export function isAuthorized() {
  const saved = sessionStorage.getItem(AUTH_CONFIG.storageKey);
  return saved === getCurrentMonthKey();
}

export function clearAuth() {
  sessionStorage.removeItem(AUTH_CONFIG.storageKey);
}

export function verifyPassword(inputPassword) {
  const expected = getExpectedPassword();
  if (!expected) return false;
  if (inputPassword !== expected) return false;

  sessionStorage.setItem(AUTH_CONFIG.storageKey, getCurrentMonthKey());
  return true;
}

export function getAuthInfo() {
  return {
    currentMonth: getCurrentMonthKey(),
    hasPasswordConfigured: !!getExpectedPassword()
  };
}

export function bindAuthGate(options) {
  const {
    gateSelector = '#authGate',
    appSelector = '#appShell',
    inputSelector = '#authPassword',
    buttonSelector = '#authBtn',
    messageSelector = '#authMessage',
    onSuccess = null
  } = options || {};

  const gate = document.querySelector(gateSelector);
  const app = document.querySelector(appSelector);
  const input = document.querySelector(inputSelector);
  const button = document.querySelector(buttonSelector);
  const message = document.querySelector(messageSelector);

  if (!gate || !app) {
    throw new Error('找不到 authGate 或 appShell 容器');
  }

  const showApp = async () => {
    gate.style.display = 'none';
    app.style.display = '';
    if (typeof onSuccess === 'function') {
      await onSuccess();
    }
  };

  const showGate = () => {
    gate.style.display = '';
    app.style.display = 'none';
  };

  if (isAuthorized()) {
    showApp();
    return true;
  }

  showGate();

  const info = getAuthInfo();
  if (!info.hasPasswordConfigured && message) {
    message.textContent = `尚未設定 ${info.currentMonth} 的密碼`;
  }

  const handleSubmit = async () => {
    const pwd = input?.value || '';
    const ok = verifyPassword(pwd);

    if (ok) {
      if (message) message.textContent = '驗證成功';
      await showApp();
      return;
    }

    if (message) message.textContent = '密碼錯誤，或本月尚未設定密碼';
    if (input) input.value = '';
    input?.focus();
  };

  button?.addEventListener('click', handleSubmit);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });

  return false;
}
