'use strict';

const STORAGE_KEY = 'profile';

const DEFAULT_PROFILE = {
  basic: { name: '', gender: '', birthDate: '', phone: '', email: '', idCard: '', nativePlace: '', ethnicity: '', politicalStatus: '', currentCity: '', homeAddress: '', height: '', weight: '' },
  schools: [], awards: [], projects: [],
  studentWorks: [], internships: [], languages: [], papers: [], patents: [], softwares: [],
  skills: '', selfEvaluation: ''
};

const EDUCATION = ['研究生', '本科', '大专', '高中'];
const DEGREE = ['博士', '硕士', '学士'];

const SCHOOL_FIELDS = [
  { key: 'name', label: '学校名称', type: 'text', ph: '如：某某大学' },
  { key: 'college', label: '院系', type: 'text', ph: '如：通信与信息工程学院' },
  { key: 'major', label: '专业', type: 'text', ph: '如：计算机科学与技术' },
  { key: 'education', label: '学历', type: 'select', options: EDUCATION },
  { key: 'degree', label: '学位', type: 'select', options: DEGREE },
  { key: 'eduType', label: '受教育类型', type: 'text', ph: '如：全日制统招' },
  { key: 'start', label: '入学时间', type: 'month' },
  { key: 'end', label: '毕业时间', type: 'month' },
  { key: 'gpa', label: 'GPA绩点', type: 'text', ph: '如：3.8/4.0' },
  { key: 'rank', label: '专业排名', type: 'text', ph: '如：1/390' },
  { key: 'rankPercent', label: '排名占比', type: 'text', ph: '如：前5%' }
];
const AWARD_FIELDS = [
  { key: 'start', label: '参加时间(起)', type: 'month' },
  { key: 'end', label: '参加时间(止)', type: 'month' },
  { key: 'date', label: '获奖时间', type: 'month' },
  { key: 'name', label: '奖项名称', type: 'text', ph: '如：国家奖学金' },
  { key: 'level', label: '奖项级别', type: 'text', ph: '如：国家级' },
  { key: 'grade', label: '奖项等级', type: 'text', ph: '如：一等奖' },
  { key: 'organizer', label: '主办单位', type: 'text', ph: '如：教育部' },
  { key: 'issuer', label: '颁发单位', type: 'text', ph: '如：某某大学' },
  { key: 'detail', label: '奖项详情', type: 'textarea', ph: '简要说明' }
];
const PROJECT_FIELDS = [
  { key: 'start', label: '开始时间', type: 'month' },
  { key: 'end', label: '结束时间', type: 'month' },
  { key: 'name', label: '项目名称', type: 'text', ph: '如：XX系统开发' },
  { key: 'role', label: '担任角色', type: 'text', ph: '如：项目负责人' },
  { key: 'content', label: '项目描述', type: 'textarea', ph: '项目内容 / 背景' },
  { key: 'duty', label: '项目职责', type: 'textarea', ph: '你在项目中负责的工作' }
];
const STUDENT_WORK_FIELDS = [
  { key: 'start', label: '开始时间', type: 'month' },
  { key: 'end', label: '结束时间', type: 'month' },
  { key: 'department', label: '部门名称', type: 'text', ph: '如：学生会宣传部' },
  { key: 'position', label: '职位', type: 'text', ph: '如：部长' },
  { key: 'content', label: '工作内容', type: 'textarea', ph: '负责的工作内容' }
];
const INTERNSHIP_FIELDS = [
  { key: 'start', label: '开始时间', type: 'month' },
  { key: 'end', label: '结束时间', type: 'month' },
  { key: 'company', label: '公司名称', type: 'text', ph: '如：某某科技公司' },
  { key: 'position', label: '岗位名称', type: 'text', ph: '如：后端开发实习生' },
  { key: 'duty', label: '工作职责', type: 'textarea', ph: '负责的工作职责' }
];
const LANGUAGE_FIELDS = [
  { key: 'language', label: '语种', type: 'text', ph: '如：英语' },
  { key: 'certificate', label: '证书', type: 'text', ph: '如：CET-6' },
  { key: 'score', label: '成绩', type: 'text', ph: '如：550' }
];
const PAPER_FIELDS = [
  { key: 'name', label: '论文名称', type: 'text', ph: '如：基于XX的研究' },
  { key: 'date', label: '发表时间', type: 'month' },
  { key: 'level', label: '论文水平', type: 'text', ph: '如：EI检索 / SCI检索' },
  { key: 'link', label: '论文链接', type: 'text', ph: '如：https://...' },
  { key: 'detail', label: '论文详情', type: 'textarea', ph: '摘要 / 说明' }
];
const PATENT_FIELDS = [
  { key: 'number', label: '申请号', type: 'text', ph: '如：CN2023xxxxx' },
  { key: 'name', label: '名称', type: 'text', ph: '如：一种XX方法' }
];
const SOFTWARE_FIELDS = [
  { key: 'completionDate', label: '完成日期', type: 'month' },
  { key: 'name', label: '软件名称', type: 'text', ph: '如：XX管理系统' },
  { key: 'overview', label: '软件概述', type: 'textarea', ph: '软件功能概述' },
  { key: 'registrationDate', label: '登记时间', type: 'month' }
];

const LISTS = {
  schools: SCHOOL_FIELDS, awards: AWARD_FIELDS, projects: PROJECT_FIELDS,
  studentWorks: STUDENT_WORK_FIELDS, internships: INTERNSHIP_FIELDS, languages: LANGUAGE_FIELDS,
  papers: PAPER_FIELDS, patents: PATENT_FIELDS, softwares: SOFTWARE_FIELDS
};
const LIST_NAMES = Object.keys(LISTS);
const BASIC_KEYS = ['name', 'gender', 'birthDate', 'phone', 'email', 'idCard', 'nativePlace', 'ethnicity', 'politicalStatus', 'currentCity', 'homeAddress', 'height', 'weight'];

let profile = JSON.parse(JSON.stringify(DEFAULT_PROFILE));

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fieldHtml(f, value) {
  const v = value == null ? '' : value;
  if (f.type === 'select') {
    const opts = ['<option value="">请选择</option>'].concat(f.options.map(o =>
      '<option value="' + esc(o) + '"' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>')).join('');
    return '<label>' + f.label + '<select data-key="' + f.key + '">' + opts + '</select></label>';
  }
  if (f.type === 'textarea') {
    return '<label class="wide">' + f.label + '<textarea data-key="' + f.key + '" rows="2" placeholder="' + esc(f.ph || '') + '">' + esc(v) + '</textarea></label>';
  }
  if (f.type === 'month') {
    return '<label>' + f.label + '<input type="month" data-key="' + f.key + '" value="' + esc(v) + '"></label>';
  }
  return '<label>' + f.label + '<input type="text" data-key="' + f.key + '" value="' + esc(v) + '" placeholder="' + esc(f.ph || '') + '"></label>';
}

function renderList(name) {
  const container = document.getElementById(name);
  container.innerHTML = '';
  (profile[name] || []).forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = LISTS[name].map(f => fieldHtml(f, item[f.key])).join('')
      + '<button class="remove" data-idx="' + idx + '">删除</button>';
    container.appendChild(row);
  });
}

// 先把 DOM 里当前已填写的内容回写到内存，避免重新渲染时丢失未保存的输入
function syncListFromDom(name) {
  const items = [];
  document.querySelectorAll('#' + name + ' .row').forEach(row => {
    const item = {};
    row.querySelectorAll('[data-key]').forEach(el => { item[el.getAttribute('data-key')] = el.value.trim(); });
    items.push(item);
  });
  profile[name] = items;
}

function collect() {
  const p = JSON.parse(JSON.stringify(DEFAULT_PROFILE));
  BASIC_KEYS.forEach(k => {
    const el = document.getElementById(k);
    if (el) p.basic[k] = el.value.trim();
  });
  LIST_NAMES.forEach(name => {
    document.querySelectorAll('#' + name + ' .row').forEach(row => {
      const item = {};
      row.querySelectorAll('[data-key]').forEach(el => { item[el.getAttribute('data-key')] = el.value.trim(); });
      if (!Object.values(item).every(v => !v)) p[name].push(item);
    });
  });
  p.skills = document.getElementById('skills').value.trim();
  p.selfEvaluation = document.getElementById('selfEvaluation').value.trim();
  return p;
}

function load() {
  chrome.storage.local.get(STORAGE_KEY, data => {
    profile = mergeProfile(DEFAULT_PROFILE, data.profile || {});
    BASIC_KEYS.forEach(k => {
      const el = document.getElementById(k);
      if (el) el.value = profile.basic[k] || '';
    });
    document.getElementById('skills').value = profile.skills || '';
    document.getElementById('selfEvaluation').value = profile.selfEvaluation || '';
    LIST_NAMES.forEach(renderList);
  });
}

function mergeProfile(def, src) {
  const out = JSON.parse(JSON.stringify(def));
  if (!src) return out;
  Object.keys(def).forEach(k => {
    if (Array.isArray(def[k])) out[k] = Array.isArray(src[k]) ? src[k] : def[k];
    else if (def[k] && typeof def[k] === 'object') out[k] = Object.assign({}, def[k], src[k] || {});
    else out[k] = src[k] == null ? def[k] : src[k];
  });
  return out;
}

function showTip(msg) {
  const tip = document.getElementById('saveTip');
  tip.textContent = msg;
  setTimeout(() => { tip.textContent = ''; }, 2500);
}

// —— 事件绑定 ——

document.querySelectorAll('.add').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.getAttribute('data-list');
    syncListFromDom(name);   // 保留已填写内容，再追加空行
    profile[name].push({});
    renderList(name);
  });
});

LIST_NAMES.forEach(name => {
  document.getElementById(name).addEventListener('click', e => {
    const rm = e.target.closest('.remove');
    if (!rm) return;
    syncListFromDom(name);   // 保留其它行已填写内容
    profile[name].splice(parseInt(rm.getAttribute('data-idx'), 10), 1);
    renderList(name);
  });
});

document.getElementById('save').addEventListener('click', () => {
  profile = collect();
  chrome.storage.local.set({ [STORAGE_KEY]: profile }, () => showTip('已保存 ✓'));
});

document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('确定清空所有已保存的资料吗？')) return;
  profile = JSON.parse(JSON.stringify(DEFAULT_PROFILE));
  chrome.storage.local.set({ [STORAGE_KEY]: profile }, () => {
    load();
    showTip('已清空');
  });
});

load();
