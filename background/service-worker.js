// 后台服务：右键菜单 + 快捷键触发填充。
'use strict';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'autofill',
    title: '在此页面自动填充个人信息',
    contexts: ['page', 'editable']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'autofill' && tab && tab.id != null) {
    sendAutofill(tab.id);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'autofill') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id != null) sendAutofill(tab.id);
});

function sendAutofill(tabId) {
  chrome.tabs.sendMessage(tabId, { action: 'autofill', overwrite: false }).catch(() => {
    // 页面未加载内容脚本（如浏览器内置页）时静默忽略
  });
}
