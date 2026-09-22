// 字段字典：把招聘网页上的字段识别为「个人资料」里的规范字段。
// 每个条目包含：
//   key      规范字段名
//   label    中文显示名（用于填充结果展示）
//   type     text / textarea / date / enum
//   resolve  从 profile 里取值的函数
//   keywords 用于字段识别的同义词（中文 + 英文，越长越优先匹配）
//   enumValues 下拉/单选的取值同义词（仅 type=enum 需要）
(function () {
  'use strict';

  function calcAge(birth) {
    if (!birth) return '';
    const y = parseInt(String(birth).slice(0, 4), 10);
    if (!y) return '';
    const now = new Date();
    let age = now.getFullYear() - y;
    const mm = parseInt(String(birth).slice(5, 7), 10);
    const dd = parseInt(String(birth).slice(8, 10), 10);
    if (!isNaN(mm) && !isNaN(dd)) {
      const md = (now.getMonth() + 1) * 100 + now.getDate();
      if (mm * 100 + dd > md) age--;
    }
    return String(age);
  }

  function joinPeriod(item, sep) {
    if (!item) return '';
    sep = sep || ' - ';
    if (item.start && item.end) return item.start + sep + item.end;
    return item.start || item.end || '';
  }

  window.AUTOFILL_DICTIONARY = [
    // —— 基本信息 ——
    { key: 'name', label: '姓名', type: 'text',
      resolve: p => p.basic && p.basic.name,
      keywords: ['姓名', '真实姓名', '您的姓名', '全名', '名字', '中文姓名',
        'fullname', 'full name', 'realname', 'real name', 'truename', 'user name', 'username', 'user_name', 'name'] },
    { key: 'gender', label: '性别', type: 'enum',
      resolve: p => p.basic && p.basic.gender,
      enumValues: [
        { value: '男', aliases: ['男', '男性', '男士', '男生', 'male', 'man'] },
        { value: '女', aliases: ['女', '女性', '女士', '女生', 'female', 'woman'] }
      ],
      keywords: ['性别', 'gender', 'sex'] },
    { key: 'birthDate', label: '出生日期', type: 'date',
      resolve: p => p.basic && p.basic.birthDate,
      keywords: ['出生日期', '出生年月', '出生年月日', '出生时间', '生日', '出生',
        'birthday', 'birthdate', 'birth date', 'birth', 'date of birth', 'dob'] },
    { key: 'age', label: '年龄', type: 'text',
      resolve: p => calcAge(p.basic && p.basic.birthDate),
      keywords: ['年龄', 'age'] },
    { key: 'phone', label: '手机号', type: 'text',
      resolve: p => p.basic && p.basic.phone,
      keywords: ['手机号', '手机号码', '手机', '联系电话', '联系手机', '移动电话', '电话号码', '电话',
        'mobile', 'mobile phone', 'mobilephone', 'phone', 'cellphone', 'tel', 'telephone'] },
    { key: 'email', label: '邮箱', type: 'text',
      resolve: p => p.basic && p.basic.email,
      keywords: ['邮箱', '电子邮箱', '电子邮件', 'email', 'e-mail', 'mail'] },
    { key: 'idCard', label: '身份证号', type: 'text',
      resolve: p => p.basic && p.basic.idCard,
      keywords: ['身份证号', '身份证号码', '身份证', '证件号码', '证件号', 'id card', 'idcard', 'id number'] },
    { key: 'nativePlace', label: '籍贯', type: 'text',
      resolve: p => p.basic && p.basic.nativePlace,
      keywords: ['籍贯', 'native place'] },
    { key: 'ethnicity', label: '民族', type: 'text',
      resolve: p => p.basic && p.basic.ethnicity,
      keywords: ['民族', 'ethnicity', 'nation'] },
    { key: 'politicalStatus', label: '政治面貌', type: 'text',
      resolve: p => p.basic && p.basic.politicalStatus,
      keywords: ['政治面貌', '政治身份', 'political status'] },
    { key: 'currentCity', label: '现居城市', type: 'text',
      resolve: p => p.basic && p.basic.currentCity,
      keywords: ['现居城市', '现居住地', '目前所在地', '所在城市', '居住城市', '居住地', 'current city', 'city'] },
    { key: 'homeAddress', label: '联系地址', type: 'textarea',
      resolve: p => p.basic && p.basic.homeAddress,
      keywords: ['家庭住址', '家庭地址', '通讯地址', '联系地址', '详细地址', '现住址', 'address'] },
    { key: 'height', label: '身高', type: 'text',
      resolve: p => p.basic && p.basic.height,
      keywords: ['身高', 'height', 'body height'] },
    { key: 'weight', label: '体重', type: 'text',
      resolve: p => p.basic && p.basic.weight,
      keywords: ['体重', 'weight', 'body weight'] },

    // —— 教育经历（默认取第一条） ——
    { key: 'schoolName', label: '学校名称', type: 'text',
      resolve: p => p.schools && p.schools[0] && p.schools[0].name,
      keywords: ['学校名称', '毕业院校', '毕业学校', '所在学校', '就读学校', '学校全称', '院校名称', '学校', '院校',
        'university', 'college', 'school', 'academy'] },
    { key: 'schoolCollege', label: '院系', type: 'text',
      resolve: p => p.schools && p.schools[0] && p.schools[0].college,
      keywords: ['所属院系', '所在院系', '院系名称', '二级学院', '学院名称', '院系', '学院', 'department', 'faculty'] },
    { key: 'major', label: '专业', type: 'text',
      resolve: p => p.schools && p.schools[0] && p.schools[0].major,
      keywords: ['所学专业', '专业名称', '主修专业', '专业', 'major', 'specialty', 'specialization'] },
    { key: 'educationDegree', label: '学历', type: 'enum',
      resolve: p => p.schools && p.schools[0] && p.schools[0].education,
      enumValues: [
        { value: '研究生', aliases: ['研究生', '硕士研究生', '硕士', 'master', 'graduate', 'postgraduate'] },
        { value: '本科', aliases: ['本科', '大学本科', 'bachelor', 'undergraduate'] },
        { value: '大专', aliases: ['大专', '专科', 'associate', 'diploma'] },
        { value: '高中', aliases: ['高中', 'high school', 'senior high'] }
      ],
      keywords: ['最高学历', '学历', '文化程度', 'education', 'education level', 'highest education'] },
    { key: 'degree', label: '学位', type: 'enum',
      resolve: p => p.schools && p.schools[0] && p.schools[0].degree,
      enumValues: [
        { value: '博士', aliases: ['博士', '博士研究生', 'phd', 'doctor'] },
        { value: '硕士', aliases: ['硕士', 'master'] },
        { value: '学士', aliases: ['学士', 'bachelor'] }
      ],
      keywords: ['学位', 'academic degree', 'degree'] },
    { key: 'schoolEduType', label: '受教育类型', type: 'text',
      resolve: p => p.schools && p.schools[0] && p.schools[0].eduType,
      keywords: ['受教育类型', '教育类型', '培养方式', '学习形式', '教育形式', '入学方式', '就读方式', '学习方式'] },
    { key: 'schoolStart', label: '入学时间', type: 'date',
      resolve: p => p.schools && p.schools[0] && p.schools[0].start,
      keywords: ['入学时间', '入学年月', '入学日期', '入学', 'enrollment', 'start date', 'start time'] },
    { key: 'schoolEnd', label: '毕业时间', type: 'date',
      resolve: p => p.schools && p.schools[0] && p.schools[0].end,
      keywords: ['毕业时间', '毕业年月', '毕业日期', '毕业', 'graduation', 'end date', 'end time'] },
    { key: 'schoolPeriod', label: '在校时间段', type: 'text',
      resolve: p => joinPeriod(p.schools && p.schools[0]),
      keywords: ['在校时间', '在校时间段', '就读时间', '学习时间', '起止时间'] },
    { key: 'gpa', label: 'GPA绩点', type: 'text',
      resolve: p => p.schools && p.schools[0] && p.schools[0].gpa,
      keywords: ['GPA', '绩点', '平均绩点', '成绩绩点', '平均学分绩点', 'gpa', 'grade point', 'grade point average'] },
    { key: 'rank', label: '专业排名', type: 'text',
      resolve: p => p.schools && p.schools[0] && p.schools[0].rank,
      keywords: ['专业排名', '综合排名', '专业成绩排名', '成绩排名', '年级排名', '排名', 'rank', 'ranking'] },
    { key: 'rankPercent', label: '排名占比', type: 'text',
      resolve: p => p.schools && p.schools[0] && p.schools[0].rankPercent,
      keywords: ['排名占比', '排名比例', '排名百分比', '成绩排名占比'] },

    // —— 获奖经历（默认取第一条） ——
    { key: 'awardStart', label: '参加时间(起)', type: 'date',
      resolve: p => p.awards && p.awards[0] && p.awards[0].start,
      keywords: ['参加时间起', '参加开始时间', '参与开始时间', '参赛开始'] },
    { key: 'awardEnd', label: '参加时间(止)', type: 'date',
      resolve: p => p.awards && p.awards[0] && p.awards[0].end,
      keywords: ['参加时间止', '参加结束时间', '参与结束时间', '参赛结束'] },
    { key: 'awardDate', label: '获奖时间', type: 'date',
      resolve: p => p.awards && p.awards[0] && p.awards[0].date,
      keywords: ['获奖时间', '获奖日期', '奖项时间', '获奖年月', 'award date'] },
    { key: 'awardName', label: '奖项名称', type: 'text',
      resolve: p => p.awards && p.awards[0] && p.awards[0].name,
      keywords: ['奖项名称', '获奖名称', '荣誉名称', '奖项', '获奖', '奖励名称', '荣誉', 'award', 'honor'] },
    { key: 'awardLevel', label: '奖项级别', type: 'text',
      resolve: p => p.awards && p.awards[0] && p.awards[0].level,
      keywords: ['奖项级别', '获奖级别', '荣誉级别', '奖励级别', 'award level'] },
    { key: 'awardGrade', label: '奖项等级', type: 'text',
      resolve: p => p.awards && p.awards[0] && p.awards[0].grade,
      keywords: ['奖项等级', '获奖等级', '荣誉等级', '奖励等级', '获奖等次', '奖项等次'] },
    { key: 'awardOrganizer', label: '主办单位', type: 'text',
      resolve: p => p.awards && p.awards[0] && p.awards[0].organizer,
      keywords: ['主办单位', '主办方', '组织单位', '举办单位', 'organizer'] },
    { key: 'awardIssuer', label: '颁发单位', type: 'text',
      resolve: p => p.awards && p.awards[0] && p.awards[0].issuer,
      keywords: ['颁发单位', '颁发机构', '发证单位', '授予单位', '颁奖单位', '颁证单位', 'issuer'] },
    { key: 'awardDetail', label: '奖项详情', type: 'textarea',
      resolve: p => p.awards && p.awards[0] && p.awards[0].detail,
      keywords: ['奖项详情', '获奖详情', '荣誉详情', '奖励详情', '获奖说明', '奖项说明'] },

    // —— 项目经历（默认取第一条） ——
    { key: 'projectStart', label: '项目开始时间', type: 'date',
      resolve: p => p.projects && p.projects[0] && p.projects[0].start,
      keywords: ['项目开始时间', '项目起始时间', '项目起止时间', '项目开始', 'project start', 'project start date'] },
    { key: 'projectEnd', label: '项目结束时间', type: 'date',
      resolve: p => p.projects && p.projects[0] && p.projects[0].end,
      keywords: ['项目结束时间', '项目结束', 'project end', 'project end date'] },
    { key: 'projectName', label: '项目名称', type: 'text',
      resolve: p => p.projects && p.projects[0] && p.projects[0].name,
      keywords: ['项目名称', '项目名', '项目标题', '项目', 'project name', 'project'] },
    { key: 'projectRole', label: '项目角色', type: 'text',
      resolve: p => p.projects && p.projects[0] && p.projects[0].role,
      keywords: ['项目角色', '个人角色', '担任角色', '你的角色', '在项目中担任的角色', '项目中的角色', '角色', 'role'] },
    { key: 'projectContent', label: '项目描述', type: 'textarea',
      resolve: p => p.projects && p.projects[0] && p.projects[0].content,
      keywords: ['项目描述', '项目内容', '项目介绍', '项目详情', '项目简介', '项目说明', 'project description', 'project detail'] },
    { key: 'projectDuty', label: '项目职责', type: 'textarea',
      resolve: p => p.projects && p.projects[0] && p.projects[0].duty,
      keywords: ['项目职责', '主要职责', '工作职责', '职责描述', '负责内容', '职责', 'responsibility', 'responsibilities'] },

    // —— 学生工作经历（默认取第一条） ——
    { key: 'studentWorkStart', label: '任职开始', type: 'date',
      resolve: p => p.studentWorks && p.studentWorks[0] && p.studentWorks[0].start,
      keywords: ['任职开始', '任职时间起', '在岗开始', '担任开始'] },
    { key: 'studentWorkEnd', label: '任职结束', type: 'date',
      resolve: p => p.studentWorks && p.studentWorks[0] && p.studentWorks[0].end,
      keywords: ['任职结束', '任职时间止', '在岗结束', '担任结束'] },
    { key: 'studentWorkDepartment', label: '部门名称', type: 'text',
      resolve: p => p.studentWorks && p.studentWorks[0] && p.studentWorks[0].department,
      keywords: ['部门名称', '所在部门', '担任部门', '学生工作部门', 'department'] },
    { key: 'studentWorkPosition', label: '学生工作职位', type: 'text',
      resolve: p => p.studentWorks && p.studentWorks[0] && p.studentWorks[0].position,
      keywords: ['担任职务', '担任职位', '学生干部职务', '干部职务', '职务名称'] },
    { key: 'studentWorkContent', label: '学生工作内容', type: 'textarea',
      resolve: p => p.studentWorks && p.studentWorks[0] && p.studentWorks[0].content,
      keywords: ['工作内容', '主要工作内容', '职务描述', '工作描述'] },

    // —— 实习经历（默认取第一条） ——
    { key: 'internshipStart', label: '实习开始', type: 'date',
      resolve: p => p.internships && p.internships[0] && p.internships[0].start,
      keywords: ['实习开始', '实习开始时间', '实习起', '实习时间起'] },
    { key: 'internshipEnd', label: '实习结束', type: 'date',
      resolve: p => p.internships && p.internships[0] && p.internships[0].end,
      keywords: ['实习结束', '实习结束时间', '实习止', '实习时间止'] },
    { key: 'internshipCompany', label: '实习公司', type: 'text',
      resolve: p => p.internships && p.internships[0] && p.internships[0].company,
      keywords: ['实习公司', '实习单位', '公司名称', '单位名称', '企业名称'] },
    { key: 'internshipPosition', label: '实习岗位', type: 'text',
      resolve: p => p.internships && p.internships[0] && p.internships[0].position,
      keywords: ['实习岗位', '岗位名称', '实习职位', '实习岗位名称', '职位名称'] },
    { key: 'internshipDuty', label: '实习职责', type: 'textarea',
      resolve: p => p.internships && p.internships[0] && p.internships[0].duty,
      keywords: ['实习职责', '工作职责', '实习内容', '工作内容', '实习描述'] },

    // —— 语言能力（默认取第一条） ——
    { key: 'language', label: '语种', type: 'text',
      resolve: p => p.languages && p.languages[0] && p.languages[0].language,
      keywords: ['语种', '语言类型', '外语语种', '语种名称', 'language', 'foreign language'] },
    { key: 'languageCertificate', label: '语言证书', type: 'text',
      resolve: p => p.languages && p.languages[0] && p.languages[0].certificate,
      keywords: ['外语证书', '语言证书', '外语等级', '英语证书', '英语等级', 'certificate', '证书'] },
    { key: 'languageScore', label: '语言成绩', type: 'text',
      resolve: p => p.languages && p.languages[0] && p.languages[0].score,
      keywords: ['语言成绩', '外语成绩', '考试成绩', '分数', 'score', '成绩'] },

    // —— 论文（默认取第一条） ——
    { key: 'paperName', label: '论文名称', type: 'text',
      resolve: p => p.papers && p.papers[0] && p.papers[0].name,
      keywords: ['论文名称', '论文题目', '论文标题', '论文', 'paper title', 'paper'] },
    { key: 'paperDate', label: '发表时间', type: 'date',
      resolve: p => p.papers && p.papers[0] && p.papers[0].date,
      keywords: ['发表时间', '发表年月', '发表日期', 'publish date', 'publication date'] },
    { key: 'paperLevel', label: '论文水平', type: 'text',
      resolve: p => p.papers && p.papers[0] && p.papers[0].level,
      keywords: ['论文水平', '论文级别', '检索情况', '收录情况', '论文等级'] },
    { key: 'paperLink', label: '论文链接', type: 'text',
      resolve: p => p.papers && p.papers[0] && p.papers[0].link,
      keywords: ['论文链接', '论文地址', '论文网址', 'paper link', 'paper url', '链接'] },
    { key: 'paperDetail', label: '论文详情', type: 'textarea',
      resolve: p => p.papers && p.papers[0] && p.papers[0].detail,
      keywords: ['论文详情', '论文摘要', '论文简介', '论文描述', '摘要'] },

    // —— 专利（默认取第一条） ——
    { key: 'patentNumber', label: '专利申请号', type: 'text',
      resolve: p => p.patents && p.patents[0] && p.patents[0].number,
      keywords: ['申请号', '专利申请号', '专利号', '申请编号', 'patent number', 'application number'] },
    { key: 'patentName', label: '专利名称', type: 'text',
      resolve: p => p.patents && p.patents[0] && p.patents[0].name,
      keywords: ['专利名称', '专利', 'patent'] },

    // —— 软著（默认取第一条） ——
    { key: 'softwareName', label: '软件名称', type: 'text',
      resolve: p => p.softwares && p.softwares[0] && p.softwares[0].name,
      keywords: ['软件名称', '软件全称', '软件著作权名称', 'software name'] },
    { key: 'softwareCompletionDate', label: '完成日期', type: 'date',
      resolve: p => p.softwares && p.softwares[0] && p.softwares[0].completionDate,
      keywords: ['完成日期', '开发完成日期', '软件完成日期', '完成时间'] },
    { key: 'softwareOverview', label: '软件概述', type: 'textarea',
      resolve: p => p.softwares && p.softwares[0] && p.softwares[0].overview,
      keywords: ['软件概述', '软件简介', '软件介绍', '软件描述', '功能概述'] },
    { key: 'softwareRegistrationDate', label: '登记时间', type: 'date',
      resolve: p => p.softwares && p.softwares[0] && p.softwares[0].registrationDate,
      keywords: ['登记时间', '登记日期', '软件登记时间', '发证日期', '证书日期'] },

    // —— 其他 ——
    { key: 'skills', label: '专业技能', type: 'textarea',
      resolve: p => p.skills,
      keywords: ['专业技能', '技能特长', '掌握技能', '特长', '技能', 'skill', 'skills'] },
    { key: 'selfEvaluation', label: '自我评价', type: 'textarea',
      resolve: p => p.selfEvaluation,
      keywords: ['自我评价', '个人评价', '自我介绍', '自我描述', '个人简介', '个人介绍', 'self evaluation', 'self introduction'] }
  ];
})();
