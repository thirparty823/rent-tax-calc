import { SCHEMES, TAX_CONSTANTS } from './rules.js';

let BRAND_CONFIG = null;
let CURRENT_BRAND = null;
let LAST_RESULT = null;

function qs(sel){ return document.querySelector(sel); }
function money(n){ return new Intl.NumberFormat('zh-TW', {maximumFractionDigits:0}).format(Math.round(n||0)); }
function getParam(name, fallback=''){ const u = new URL(window.location.href); return u.searchParams.get(name) ?? fallback; }
function setIf(el, value){ if (value !== null && value !== undefined && value !== '') el.value = value; }

async function loadBrandConfig() {
  const res = await fetch('./brand.config.json');
  BRAND_CONFIG = await res.json();
  const key = getParam('brand', BRAND_CONFIG.defaultBrand);
  CURRENT_BRAND = BRAND_CONFIG.brands[key] ? key : BRAND_CONFIG.defaultBrand;
  const b = BRAND_CONFIG.brands[CURRENT_BRAND];

  qs('#brandTitle').textContent = b.displayName;
  const link = qs('#brandPrimaryLink');
  link.href = b.primaryLinkUrl;
  link.textContent = b.primaryLinkLabel;

  if (b.logoUrl) {
    const img = qs('#brandLogo');
    img.src = b.logoUrl;
    img.style.display = 'block';
  }
  qs('#footerDisclaimer').textContent = b.footerDisclaimer;
}

function initSchemeSelect(){
  const sel = qs('#scheme');
  SCHEMES.forEach(s => {
    const o = document.createElement('option');
    o.value = s.code;
    o.textContent = s.name;
    sel.appendChild(o);
  });
}

function applyPrefill(){
  setIf(qs('#scheme'), getParam('scheme'));
  setIf(qs('#monthlyRent'), getParam('rent'));
  setIf(qs('#tenantType'), getParam('tenant'));
  setIf(qs('#resident'), getParam('resident'));
  setIf(qs('#marginalRate'), getParam('mtr'));
}

function getScheme(code){ return SCHEMES.find(s => s.code === code); }

function shouldWithhold(tenantType, assumePersonWithholding){
  if (tenantType === 'corp') return true;
  return !!assumePersonWithholding;
}

function calcWht(monthlyRent, isResident, tenantType, assumePersonWithholding){
  if (!shouldWithhold(tenantType, assumePersonWithholding)) return { tax: 0, rate: isResident ? TAX_CONSTANTS.WHT_RESIDENT : TAX_CONSTANTS.WHT_NON_RESIDENT, applied:false };
  const rate = isResident ? TAX_CONSTANTS.WHT_RESIDENT : TAX_CONSTANTS.WHT_NON_RESIDENT;
  return { tax: monthlyRent * rate, rate, applied:true };
}

function calcNhi(monthlyRent, tenantType, useThreshold, assumePersonWithholding){
  if (!shouldWithhold(tenantType, assumePersonWithholding)) return { fee:0, triggered:false, applied:false };
  if (useThreshold && monthlyRent < TAX_CONSTANTS.NHI_THRESHOLD) return { fee:0, triggered:false, applied:true };
  return { fee: monthlyRent * TAX_CONSTANTS.NHI_RATE, triggered:true, applied:true };
}

function calcAnnualRentIncome(monthlyRent, scheme){
  const annualRent = monthlyRent * 12;
  const exemptAnnual = (scheme.rent_exempt_per_month || 0) * 12;

  if (scheme.expense_mode === 'standard') {
    const taxableBase = Math.max(0, annualRent - exemptAnnual);
    const expense = taxableBase * (scheme.expense_rate || 0);
    return {
      annualRent,
      exemptAnnual,
      taxableBase,
      expense,
      income: taxableBase - expense,
      note: `每月免稅額 ${money(scheme.rent_exempt_per_month||0)}；費用率 ${(scheme.expense_rate*100).toFixed(0)}%`
    };
  }

  if (scheme.expense_mode === 'banded17') {
    // 依租賃條例17：每月 6,000 以下免稅；6,000~20,000 部分費用率 53%；超過 20,000 部分先以 43% 試算（1.0）
    const m = monthlyRent;
    const exempt = 6000;
    const partA = Math.min(Math.max(m - exempt, 0), 14000); // 6000~20000
    const partB = Math.max(m - 20000, 0); // >20000
    const expenseM = partA * 0.53 + partB * 0.43;
    const taxableBaseM = Math.max(m - exempt, 0);
    const incomeM = taxableBaseM - expenseM;
    return {
      annualRent,
      exemptAnnual: exempt * 12,
      taxableBase: taxableBaseM * 12,
      expense: expenseM * 12,
      income: incomeM * 12,
      note: '租賃條例§17 試算：每月6,000免稅；6,000~20,000費用率53%；超過20,000部分先以43%試算（1.0）'
    };
  }

  throw new Error('Unknown scheme expense mode');
}

function calcEstimatedTax(rentIncomeAnnual, marginalRatePct){
  return rentIncomeAnnual * (marginalRatePct / 100);
}

function renderSources(scheme){
  const ul = qs('#sources');
  ul.innerHTML = '';
  scheme.sources.forEach(s => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url; a.target = '_blank'; a.rel = 'noreferrer'; a.textContent = s.label;
    li.appendChild(a);
    ul.appendChild(li);
  });
}

function renderResult(r){
  qs('#outWht').textContent = r.wht.applied ? `${money(r.wht.tax)} 元（${(r.wht.rate*100).toFixed(0)}%）` : '0 元（自然人承租預設不扣）';
  qs('#outNhi').textContent = !r.nhi.applied ? '0 元（自然人承租預設不扣）' : (r.nhi.triggered ? `${money(r.nhi.fee)} 元（2.11%）` : '0 元（未達門檻）');
  qs('#outRentIncome').textContent = `${money(r.annual.income)} 元`;
  qs('#outEstTax').textContent = `${money(r.estTax)} 元`;
  qs('#outAssumption').textContent = `方案前提：${r.scheme.shortCondition}｜${r.annual.note}`;
}

function buildCopyText(r){
  const brand = BRAND_CONFIG.brands[CURRENT_BRAND];
  return [
    `【${brand.displayName}｜租賃稅務試算】`,
    `方案：${r.scheme.name}`,
    `每月租金：${money(r.input.monthlyRent)} 元`,
    `承租人：${r.input.tenantType === 'corp' ? '法人/公司/機關' : '自然人'}`,
    `屋主身分：${r.input.isResident ? '居住者' : '非居住者'}`,
    `扣繳稅額：${r.wht.applied ? money(r.wht.tax) + ' 元' : '0 元（未套扣繳）'}`,
    `二代健保：${r.nhi.applied ? (r.nhi.triggered ? money(r.nhi.fee)+' 元' : '0 元（未達門檻）') : '0 元（未套扣費）'}`,
    `估算年度租賃所得：${money(r.annual.income)} 元`,
    `估算年度所得稅（邊際稅率 ${r.input.marginalRate}%）：${money(r.estTax)} 元`,
    `提醒：本工具為試算，實際以法規與主管機關認定為準。`,
    `${brand.primaryLinkLabel}：${brand.primaryLinkUrl}`
  ].join('\n');
}

function buildReportUrl(){
  const u = new URL('./report.html', window.location.href);
  ['brand','scheme','rent','tenant','resident','mtr'].forEach(k => {
    const v = getParam(k);
    if (v) u.searchParams.set(k,v);
  });
  // 同步目前畫面值
  u.searchParams.set('brand', CURRENT_BRAND);
  u.searchParams.set('scheme', qs('#scheme').value);
  u.searchParams.set('rent', qs('#monthlyRent').value || '0');
  u.searchParams.set('tenant', qs('#tenantType').value);
  u.searchParams.set('resident', qs('#resident').value);
  u.searchParams.set('mtr', qs('#marginalRate').value);
  u.searchParams.set('nhiThreshold', qs('#enableNhiThreshold').checked ? '1' : '0');
  u.searchParams.set('personWithholding', qs('#assumePersonWithholding').checked ? '1' : '0');
  return u.toString();
}

function syncUrlParamsFromInputs(){
  const u = new URL(window.location.href);
  u.searchParams.set('brand', CURRENT_BRAND);
  u.searchParams.set('scheme', qs('#scheme').value);
  u.searchParams.set('rent', qs('#monthlyRent').value || '0');
  u.searchParams.set('tenant', qs('#tenantType').value);
  u.searchParams.set('resident', qs('#resident').value);
  u.searchParams.set('mtr', qs('#marginalRate').value);
  window.history.replaceState({}, '', u.toString());
}

function runCalc(){
  const scheme = getScheme(qs('#scheme').value);
  const monthlyRent = Number(qs('#monthlyRent').value || 0);
  const tenantType = qs('#tenantType').value;
  const isResident = qs('#resident').value === 'yes';
  const marginalRate = Number(qs('#marginalRate').value || 5);
  const useThreshold = qs('#enableNhiThreshold').checked;
  const assumePersonWithholding = qs('#assumePersonWithholding').checked;

  const wht = calcWht(monthlyRent, isResident, tenantType, assumePersonWithholding);
  const nhi = calcNhi(monthlyRent, tenantType, useThreshold, assumePersonWithholding);
  const annual = calcAnnualRentIncome(monthlyRent, scheme);
  const estTax = calcEstimatedTax(annual.income, marginalRate);

  LAST_RESULT = {
    input: { monthlyRent, tenantType, isResident, marginalRate, useThreshold, assumePersonWithholding },
    scheme, wht, nhi, annual, estTax
  };

  renderResult(LAST_RESULT);
  renderSources(scheme);
  syncUrlParamsFromInputs();
}

async function copyResult(){
  if (!LAST_RESULT) runCalc();
  const txt = buildCopyText(LAST_RESULT);
  try {
    await navigator.clipboard.writeText(txt);
    alert('已複製結果文字，可直接貼到 LINE 或訊息。');
  } catch {
    alert('複製失敗，請改用手動複製。');
  }
}

function initEvents(){
  qs('#calcBtn').addEventListener('click', runCalc);
  qs('#copyBtn').addEventListener('click', copyResult);
  qs('#reportBtn').addEventListener('click', () => window.open(buildReportUrl(), '_blank'));
}

(async function bootstrap(){
  initSchemeSelect();
  await loadBrandConfig();
  applyPrefill();
  initEvents();
  runCalc();
})();
