// 内容脚本：监听来自 popup / 右键菜单 / 快捷键的填充指令，读取本地资料并执行填充。
(function () {
  'use strict';
  if (window.__AUTOFILL_CONTENT__) return;
  window.__AUTOFILL_CONTENT__ = true;

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || msg.action !== 'autofill') return;
    chrome.storage.local.get('profile', (data) => {
      const profile = data.profile || {};
      let result;
      try {
        result = window.AUTOFILL ? window.AUTOFILL.run(profile, { overwrite: !!msg.overwrite }) : null;
      } catch (e) {
        result = { error: String(e) };
      }
      sendResponse(result);
    });
    return true; // 异步响应
  });
})();
