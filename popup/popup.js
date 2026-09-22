'use strict';

const fillBtn = document.getElementById('fillBtn');
const overwriteEl = document.getElementById('overwrite');
const statusEl = document.getElementById('status');
const openOptions = document.getElementById('openOptions');

openOptions.addEventListener('click', () => chrome.runtime.openOptionsPage());

chrome.storage.local.get('profile', ({ profile }) => {
  if (!profile || isEmpty(profile)) {
    statusEl.innerHTML = '⚠️ 尚未填写个人资料，请先点击「编辑个人资料」。';
  }
});

fillBtn.addEventListener('click', async () => {
  const overwrite = overwriteEl.checked;
  statusEl.innerHTML = '正在填充…';
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || tab.id == null) { statusEl.innerHTML = '无法获取当前页面'; return; }
  try {
    const res = await chrome.tabs.sendMessage(tab.id, { action: 'autofill', overwrite });
    render(res);
  } catch (e) {
    statusEl.innerHTML = '当前页面无法填充：插件未加载或非普通网页（如浏览器内置页）。';
  }
});

function render(res) {
  if (!res) { statusEl.innerHTML = '没有返回结果'; return; }
  if (res.error) { statusEl.innerHTML = '出错：' + esc(res.error); return; }
  const filled = res.filled || [];
  const skipped = res.skipped || [];
  let html = '✅ 已填充 <b>' + filled.length + '</b> 项';
  if (skipped.length) html += '，跳过 ' + skipped.length + ' 项';
  if (filled.length) {
    html += '<ul>' + filled.slice(0, 20).map(f =>
      '<li>' + esc(f.label) + '：' + esc(String(f.value)) + '</li>').join('') + '</ul>';
    if (filled.length > 20) html += '<li>…共 ' + filled.length + ' 项</li>';
  }
  if (skipped.length) {
    html += '<div style="color:#888;margin-top:6px">跳过：' +
      skipped.slice(0, 8).map(s => esc(s.label) + '（' + esc(s.reason) + '）').join('、') + '</div>';
  }
  statusEl.innerHTML = html;
}

function isEmpty(profile) {
  const b = profile.basic || {};
  return !(b.name || b.gender || b.birthDate || b.phone || b.email ||
    (profile.schools && profile.schools.length) ||
    (profile.awards && profile.awards.length) ||
    (profile.projects && profile.projects.length) ||
    profile.skills || profile.selfEvaluation);
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
