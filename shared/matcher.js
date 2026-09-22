// 匹配引擎：遍历页面表单字段 -> 字段识别 -> 填值。依赖 field-dictionary.js 先加载。
(function () {
  'use strict';

  const DICT = window.AUTOFILL_DICTIONARY || [];

  // 归一化：小写 + 拆分 camelCase / snake_case / kebab-case，方便英文关键词匹配
  function norm(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/_/g, ' ').replace(/-/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  }

  function labelText(el) {
    if (el.id) {
      try {
        const l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
        if (l) return (l.innerText || l.textContent || '');
      } catch (e) {}
    }
    const wrap = el.closest('label');
    if (wrap) return (wrap.innerText || wrap.textContent || '');
    return '';
  }

  function prevText(el) {
    let s = el.previousElementSibling;
    while (s) {
      const t = (s.innerText || s.textContent || '').trim();
      if (t && t.length <= 20) return t;
      if (['SPAN', 'LABEL', 'I', 'B', 'DIV', 'P', 'EM', 'STRONG'].indexOf(s.tagName) < 0) break;
      s = s.previousElementSibling;
    }
    return '';
  }

  // 收集一个字段的“识别信号”，带权重
  function collectSignals(el) {
    const sig = [];
    const push = (text, w) => {
      const t = norm(text).trim();
      if (t && t.length <= 80) sig.push({ text: t, weight: w });
    };
    push(labelText(el), 4);
    push(el.getAttribute('placeholder'), 4);
    push(el.getAttribute('aria-label'), 4);
    push(el.getAttribute('title'), 2);
    push(el.getAttribute('name'), 3);
    push(el.getAttribute('id'), 3);
    push(el.getAttribute('class'), 1);
    push(prevText(el), 3);
    // 兜底：最近的容器文本（限短文本）
    const anc = el.closest('div, li, td, p');
    if (anc) {
      const t = (anc.innerText || '').trim();
      if (t && t.length <= 40) push(t, 1);
    }
    return sig;
  }

  // 为字段匹配最合适的字典条目，返回 { entry, score } 或 null
  function matchEntry(el) {
    const sig = collectSignals(el);
    let best = null;
    for (const entry of DICT) {
      let score = 0;
      for (const s of sig) {
        for (const kw of entry.keywords) {
          const k = norm(kw);
          if (k && s.text.indexOf(k) >= 0) {
            score = Math.max(score, k.length * s.weight);
          }
        }
      }
      if (score > 0 && (!best || score > best.score)) best = { entry, score };
    }
    return best;
  }

  function safeResolve(entry, profile) {
    try { return entry.resolve(profile); } catch (e) { return ''; }
  }

  function isFillable(el, opts) {
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    if (el.disabled) return false;
    if (['hidden', 'submit', 'button', 'reset', 'image', 'file', 'password'].indexOf(type) >= 0) return false;
    if (el.type !== 'hidden' && el.offsetParent === null && el.getClientRects().length === 0) return false;
    if (!opts.overwrite) {
      if (el.tagName === 'SELECT') {
        if (el.selectedIndex > 0 && el.options[el.selectedIndex].value) return false;
      } else if (el.value && el.value.trim() !== '') return false;
    }
    return true;
  }

  function setNativeValue(el, value) {
    try { el.focus({ preventScroll: true }); } catch (e) {}
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) desc.set.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function aliasScore(t, aliases) {
    if (!t) return 0;
    let best = 0;
    for (const a of aliases) {
      const na = norm(a);
      if (!na) continue;
      if (t.indexOf(na) >= 0 || na.indexOf(t) >= 0) best = Math.max(best, na.length);
    }
    return best;
  }

  function fillSelectEnum(el, entry, value) {
    const target = (entry.enumValues || []).find(v => v.value === value);
    const aliases = target ? target.aliases : [String(value)];
    let best = null;
    Array.from(el.options).forEach(o => {
      const t = norm(o.text);
      if (!t || !o.value || /^(请选择|请填写|请选择项|不限|--|0)$/.test(o.text.trim())) return;
      const sc = aliasScore(t, aliases);
      if (sc > 0 && (!best || sc > best.sc)) best = { o, sc };
    });
    if (!best) {
      for (const o of el.options) {
        if (o.value === String(value) || o.text.trim() === String(value)) { best = { o, sc: 1 }; break; }
      }
    }
    if (best) {
      el.value = best.o.value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return { ok: true, matched: best.o.text.trim() };
    }
    return { reason: '未找到匹配选项: ' + value };
  }

  function detectDateUnit(el) {
    const s = norm([el.name, el.id, el.getAttribute('aria-label'), labelText(el), prevText(el)].join(' '));
    if (/day|日|天/.test(s)) return 'day';
    if (/month|月/.test(s)) return 'month';
    if (/year|年/.test(s)) return 'year';
    return null;
  }

  function fillSelectDate(el, value) {
    const unit = detectDateUnit(el);
    const nums = (String(value).match(/\d{4}|\d{1,2}/g) || []).map(Number);
    let target = null;
    if (unit === 'year') target = nums[0];
    else if (unit === 'month') target = nums[1];
    else if (unit === 'day') target = nums[2];
    if (target == null || isNaN(target)) return { reason: '无法判断该下拉框的日期单位' };
    let chosen = null;
    Array.from(el.options).forEach(o => {
      const n = parseInt(o.text, 10);
      if (!isNaN(n) && n === target) chosen = o;
      else if (!chosen && (o.value === String(target) || o.value === String(target).padStart(2, '0'))) chosen = o;
    });
    if (chosen) {
      el.value = chosen.value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true, matched: chosen.text.trim() };
    }
    return { reason: '下拉框缺少对应选项: ' + target };
  }

  function formatDate(value, type) {
    const m = String(value).match(/(\d{4})\D*(\d{1,2})?\D*(\d{1,2})?/);
    if (!m) return String(value);
    const y = m[1];
    const mo = m[2] ? String(m[2]).padStart(2, '0') : null;
    const d = m[3] ? String(m[3]).padStart(2, '0') : null;
    if (type === 'month') return mo ? y + '-' + mo : y + '-01';
    if (type === 'date') return y + '-' + (mo || '01') + '-' + (d || '01');
    return String(value);
  }

  function fillElement(el, entry, value) {
    const tag = el.tagName.toLowerCase();
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    if (tag === 'select') {
      if (entry.type === 'date') return fillSelectDate(el, value);
      return fillSelectEnum(el, entry, value);
    }
    if (type === 'date' || type === 'month' || entry.type === 'date') {
      setNativeValue(el, formatDate(value, type));
      return { ok: true };
    }
    setNativeValue(el, String(value));
    return { ok: true };
  }

  let styleInjected = false;
  function ensureHighlightStyle() {
    if (styleInjected || !document.head) return;
    const st = document.createElement('style');
    st.textContent = '.autofill-flash{outline:2px solid #4c8bf5 !important;box-shadow:0 0 0 2px rgba(76,139,245,.35) !important;transition:outline .3s,box-shadow .3s;}';
    document.head.appendChild(st);
    styleInjected = true;
  }
  function highlight(el) {
    el.classList.add('autofill-flash');
    setTimeout(() => el.classList.remove('autofill-flash'), 1500);
  }

  function run(profile, opts) {
    opts = opts || {};
    const filled = [];
    const skipped = [];
    ensureHighlightStyle();

    // 1) 单选组（如性别：○男 ○女）
    const groups = {};
    document.querySelectorAll('input[type="radio"]').forEach(r => {
      const n = r.getAttribute('name') || '__none__';
      (groups[n] = groups[n] || []).push(r);
    });
    Object.keys(groups).forEach(name => {
      const radios = groups[name];
      const rep = radios[0];
      if (!isFillable(rep, opts)) return;
      const m = matchEntry(rep);
      if (!m) return;
      const entry = m.entry;
      const value = safeResolve(entry, profile);
      if (value == null || value === '') { skipped.push({ label: entry.label, reason: '资料未填写' }); return; }
      if (entry.type !== 'enum') { skipped.push({ label: entry.label, reason: '字段类型不支持' }); return; }
      const target = (entry.enumValues || []).find(v => v.value === value);
      const aliases = target ? target.aliases : [String(value)];
      let chosen = null;
      for (const r of radios) {
        if (r.disabled) continue;
        const t = norm(labelText(r) || prevText(r) || r.value);
        const sc = aliasScore(t, aliases);
        if (sc > 0 && (!chosen || sc > chosen.sc)) chosen = { r, sc };
      }
      if (chosen) {
        if (!opts.overwrite && radios.some(x => x.checked)) {
          skipped.push({ label: entry.label, reason: '已填写' });
        } else {
          chosen.r.checked = true;
          chosen.r.dispatchEvent(new Event('change', { bubbles: true }));
          chosen.r.dispatchEvent(new Event('input', { bubbles: true }));
          highlight(chosen.r);
          filled.push({ label: entry.label, value: value });
        }
      } else {
        skipped.push({ label: entry.label, reason: '未找到匹配选项' });
      }
    });

    // 2) 普通 input / select / textarea
    document.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.type === 'radio' || el.type === 'checkbox') return;
      if (!isFillable(el, opts)) return;
      const m = matchEntry(el);
      if (!m) return;
      const entry = m.entry;
      const value = safeResolve(entry, profile);
      if (value == null || value === '') { skipped.push({ label: entry.label, reason: '资料未填写' }); return; }
      const r = fillElement(el, entry, value);
      if (r && r.ok) {
        highlight(el);
        filled.push({ label: entry.label, value: r.matched || value });
      } else if (r && r.reason) {
        skipped.push({ label: entry.label, reason: r.reason });
      }
    });

    return {
      filled: filled,
      skipped: skipped,
      filledCount: filled.length,
      skippedCount: skipped.length
    };
  }

  window.AUTOFILL = { run: run };
})();
