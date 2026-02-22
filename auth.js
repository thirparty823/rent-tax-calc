// Weak protection (client-side password gate)
// 注意：這不是安全防護，程式碼與密碼仍可被看到；僅作最低門檻限制。
(() => {
  const AUTH_KEY = 'rentTaxCalcAuth_v1';
  const PASSWORD = '1234'; // 
  const TITLE = '租賃稅務試算器';
  const SUBTITLE = '請輸入存取密碼';

  function isAuthed() {
    try { return sessionStorage.getItem(AUTH_KEY) === 'ok'; } catch { return false; }
  }
  function setAuthed() {
    try { sessionStorage.setItem(AUTH_KEY, 'ok'); } catch {}
  }

  function buildGate() {
    const style = document.createElement('style');
    style.textContent = `
      .auth-mask{position:fixed;inset:0;background:rgba(255,255,255,.96);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px}
      .auth-card{width:min(420px,95vw);border:1px solid #ddd;border-radius:12px;background:#fff;padding:18px;box-shadow:0 8px 24px rgba(0,0,0,.08)}
      .auth-card h1{margin:0 0 6px;font-size:20px}
      .auth-card p{margin:0 0 12px;color:#666;font-size:13px}
      .auth-row{display:flex;gap:8px}
      .auth-row input{flex:1;padding:10px 12px;border:1px solid #ccc;border-radius:8px;font-size:16px}
      .auth-row button{padding:10px 14px;border:1px solid #111;background:#111;color:#fff;border-radius:8px;cursor:pointer}
      .auth-err{margin-top:8px;color:#b00020;font-size:13px;min-height:18px}
      .auth-note{margin-top:10px;color:#777;font-size:12px}
    `;
    document.head.appendChild(style);

    const mask = document.createElement('div');
    mask.className = 'auth-mask';
    mask.innerHTML = `
      <div class="auth-card">
        <h1>${TITLE}</h1>
        <p>${SUBTITLE}</p>
        <div class="auth-row">
          <input id="authPwdInput" type="password" placeholder="輸入密碼" />
          <button id="authPwdBtn" type="button">進入</button>
        </div>
        <div class="auth-err" id="authPwdErr"></div>
    document.body.appendChild(mask);

    const input = mask.querySelector('#authPwdInput');
    const btn = mask.querySelector('#authPwdBtn');
    const err = mask.querySelector('#authPwdErr');

    const submit = () => {
      const val = (input.value || '').trim();
      if (!PASSWORD) {
        err.textContent = '尚未設定密碼（請在 auth.js 設定 PASSWORD）';
        return;
      }
      if (val === PASSWORD) {
        setAuthed();
        mask.remove();
      } else {
        err.textContent = '密碼錯誤';
        input.select();
      }
    };
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    setTimeout(() => input.focus(), 0);
  }

  function init() {
    if (isAuthed()) return;
    buildGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
