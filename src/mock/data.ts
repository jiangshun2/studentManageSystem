/**
 * 模拟数据库 - 完整 mock 数据集
 * 数据量：约 120 名学生、30 名教师、120 门课程、1200+ 条成绩记录
 */

// ========== 类型定义 ==========
export type Role = 'student' | 'teacher' | 'admin';
export type Semester = '春' | '秋';
export type CourseCategory = '必修' | '选修' | '实践' | '通识';
export type UserStatus = '正常' | '停用' | '注销' | '待审核';
export type ScoreLevel = '优秀' | '良好' | '中等' | '及格' | '不及格';

export interface User {
  id: string;
  username: string;
  password: string; // 明文仅用于 mock
  role: Role;
  name: string;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
}

export interface Student extends User {
  role: 'student';
  studentNo: string;
  gender: '男' | '女';
  major: string;
  className: string;
  enrollmentYear: number;
  phone: string;
  email: string;
  totalCreditsRequired: number;
}

export interface Teacher extends User {
  role: 'teacher';
  teacherNo: string;
  gender: '男' | '女';
  title: string; // 职称
  department: string;
  phone: string;
  email: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Course {
  id: string;
  courseNo: string;
  name: string;
  englishName?: string;
  credits: number;
  hours: number;
  category: CourseCategory;
  semester: Semester;
  year: number;
  teacherId: string;
  description: string;
  capacity: number;
  selected: number;
  syllabus?: string;
}

export interface Score {
  id: string;
  studentId: string;
  courseId: string;
  teacherId: string;
  usual?: number; // 平时
  midterm?: number; // 期中
  final?: number; // 期末
  experiment?: number; // 实验
  total: number; // 总评
  gpa: number; // 绩点
  level: ScoreLevel;
  examTime: string; // 考试时间
  semester: Semester;
  year: number;
  status: '已提交' | '待审核' | '草稿' | '已归档';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: '成绩发布' | '成绩修改' | '审核结果' | '系统通知';
  read: boolean;
  createdAt: string;
}

export interface ScoreApplication {
  id: string;
  scoreId: string;
  teacherId: string;
  reason: string;
  oldTotal: number;
  newTotal: number;
  status: '待审核' | '已通过' | '已拒绝';
  createdAt: string;
  handledAt?: string;
  handlerId?: string;
  comment?: string;
}

export interface DeregisterApplication {
  id: string;
  studentId: string;
  reason: string;
  status: '待审核' | '已通过' | '已拒绝';
  createdAt: string;
  handledAt?: string;
  comment?: string;
}

// ========== 院系 / 专业 / 班级 ==========
export const departments = [
  '计算机科学与技术学院',
  '电子信息工程学院',
  '机械工程学院',
  '经济管理学院',
  '外国语学院',
  '数学与统计学院',
  '物理与光电工程学院',
  '化学与化工学院',
  '生命科学学院',
  '马克思主义学院',
];

export const majors = [
  '计算机科学与技术',
  '软件工程',
  '人工智能',
  '数据科学与大数据技术',
  '电子信息工程',
  '通信工程',
  '机械设计制造及其自动化',
  '工商管理',
  '市场营销',
  '会计学',
  '英语',
  '日语',
  '数学与应用数学',
  '统计学',
  '应用物理学',
];

// ========== 工具函数 ==========
const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const pad = (n: number, len = 2) => String(n).padStart(len, '0');

// 根据分数判定等级
export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '中等';
  if (score >= 60) return '及格';
  return '不及格';
}

// 分数 -> 绩点
export function scoreToGpa(score: number): number {
  if (score >= 90) return 4.0;
  if (score >= 85) return 3.7;
  if (score >= 82) return 3.3;
  if (score >= 78) return 3.0;
  if (score >= 75) return 2.7;
  if (score >= 72) return 2.3;
  if (score >= 68) return 2.0;
  if (score >= 64) return 1.5;
  if (score >= 60) return 1.0;
  return 0;
}

// 总评计算（按课程类型）
export function calcTotal(
  category: CourseCategory,
  usual?: number,
  midterm?: number,
  final?: number,
  experiment?: number
): number {
  switch (category) {
    case '必修':
    case '通识':
    case '选修':
      // 理论课
      return Math.round(
        (usual ?? 0) * 0.2 + (midterm ?? 0) * 0.3 + (final ?? 0) * 0.5
      );
    case '实践':
      return Math.round(
        (usual ?? 0) * 0.3 + (experiment ?? 0) * 0.4 + (final ?? 0) * 0.3
      );
    default:
      return Math.round(
        (usual ?? 0) * 0.2 + (experiment ?? 0) * 0.8
      );
  }
}

// ========== 生成数据 ==========
function generateName(): string {
  const surnames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'];
  const givenChars = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '霞', '平', '刚', '桂英', '鹏', '华'];
  return pick(surnames) + pick(givenChars) + (Math.random() > 0.5 ? pick(givenChars) : '');
}

// 管理员
export const admins: Admin[] = [
  { id: 'A001', username: 'admin', password: 'admin123', role: 'admin', name: '系统管理员', status: '正常', createdAt: '2020-01-01' },
];

// 教师 30 名
const teacherTitles = ['教授', '副教授', '讲师', '助教'];
export const teachers: Teacher[] = Array.from({ length: 30 }, (_, i) => {
  const id = `T${pad(i + 1, 3)}`;
  const teacherNo = `T${20240000 + i + 1}`;
  const department = pick(departments);
  const name = generateName();
  return {
    id,
    username: teacherNo,
    password: '123456',
    role: 'teacher',
    name,
    status: '正常' as UserStatus,
    teacherNo,
    gender: Math.random() > 0.5 ? '男' : '女',
    title: pick(teacherTitles),
    department,
    phone: `1${random(3, 9)}${random(1000000, 9999999)}`,
    email: `${teacherNo}@school.edu.cn`,
    createdAt: `${2020 + random(0, 4)}-${pad(random(1, 12))}-${pad(random(1, 28))}`,
  };
});

// 学生 120 名
export const students: Student[] = Array.from({ length: 120 }, (_, i) => {
  const id = `S${pad(i + 1, 4)}`;
  const studentNo = `2024${pad(i + 1, 5)}`;
  const major = pick(majors);
  const classNum = random(1, 4);
  const className = `${major.slice(0, 2)}${classNum}班`;
  const name = generateName();
  return {
    id,
    username: studentNo,
    password: '123456',
    role: 'student',
    name,
    status: '正常' as UserStatus,
    studentNo,
    gender: Math.random() > 0.5 ? '男' : '女',
    major,
    className,
    enrollmentYear: 2024,
    phone: `1${random(3, 9)}${random(1000000, 9999999)}`,
    email: `${studentNo}@school.edu.cn`,
    totalCreditsRequired: 160,
    createdAt: `2024-09-01`,
  };
});

// 课程 120 门（覆盖 3 个学年 × 2 个学期）
const courseNamePool = [
  ['计算机组成原理', 'Computer Organization', '必修', 4, 64],
  ['数据结构', 'Data Structures', '必修', 4, 64],
  ['操作系统', 'Operating Systems', '必修', 4, 64],
  ['数据库系统原理', 'Database Systems', '必修', 3, 48],
  ['计算机网络', 'Computer Networks', '必修', 3, 48],
  ['软件工程', 'Software Engineering', '必修', 3, 48],
  ['机器学习', 'Machine Learning', '选修', 3, 48],
  ['深度学习与应用', 'Deep Learning', '选修', 2, 32],
  ['Web 开发技术', 'Web Development', '选修', 2, 32],
  ['移动应用开发', 'Mobile Development', '选修', 2, 32],
  ['高等数学 A', 'Advanced Mathematics A', '必修', 5, 80],
  ['线性代数', 'Linear Algebra', '必修', 3, 48],
  ['概率论与数理统计', 'Probability & Statistics', '必修', 3, 48],
  ['离散数学', 'Discrete Mathematics', '必修', 3, 48],
  ['大学英语 I', 'College English I', '必修', 2, 32],
  ['大学英语 II', 'College English II', '必修', 2, 32],
  ['大学物理', 'College Physics', '必修', 4, 64],
  ['电路分析基础', 'Circuit Analysis', '必修', 3, 48],
  ['模拟电子技术', 'Analog Electronics', '必修', 3, 48],
  ['数字电子技术', 'Digital Electronics', '必修', 3, 48],
  ['信号与系统', 'Signals and Systems', '必修', 3, 48],
  ['马克思主义基本原理', 'Marxism Principles', '通识', 3, 48],
  ['毛泽东思想概论', 'Mao Zedong Thought', '通识', 2, 32],
  ['中国近现代史纲要', 'Modern Chinese History', '通识', 2, 32],
  ['思想道德与法治', 'Ideology and Rule of Law', '通识', 3, 48],
  ['大学生心理健康', 'Mental Health', '通识', 1, 16],
  ['体育 I', 'Physical Education I', '通识', 1, 32],
  ['体育 II', 'Physical Education II', '通识', 1, 32],
  ['创新创业基础', 'Innovation & Entrepreneurship', '通识', 1, 16],
  ['工程实训', 'Engineering Practice', '实践', 2, 32],
  ['课程设计', 'Course Design', '实践', 2, 32],
  ['毕业实习', 'Graduation Practice', '实践', 4, 64],
  ['毕业设计', 'Graduation Project', '实践', 8, 128],
] as const;

export const courses: Course[] = [];
let courseCounter = 0;
const years = [2023, 2024, 2025];
const semesters: Semester[] = ['春', '秋'];
courseNamePool.forEach((row, idx) => {
  const [name, enName, category, credits, hours] = row;
  years.forEach((year) => {
    semesters.forEach((sem) => {
      courseCounter++;
      const teacher = teachers[(idx + courseCounter) % teachers.length];
      courses.push({
        id: `C${pad(courseCounter, 4)}`,
        courseNo: `C${year}${pad(idx + 1, 3)}${sem === '春' ? '1' : '2'}`,
        name,
        englishName: enName,
        credits,
        hours,
        category: category as CourseCategory,
        semester: sem,
        year,
        teacherId: teacher.id,
        description: `本课程系统介绍${name}的基本概念、核心原理与典型应用，通过理论讲授与实践训练相结合，帮助学生建立扎实的专业基础。`,
        capacity: random(60, 120),
        selected: random(40, 100),
        syllabus: `第1章 概述\n第2章 基础理论\n第3章 核心技术\n第4章 进阶内容\n第5章 综合实践\n第6章 课程总结`,
      });
    });
  });
});

// 成绩 - 每个学生针对前 4 个学期（2023春、2023秋、2024春、2024秋）的课程有成绩
export const scores: Score[] = [];
let scoreCounter = 0;
students.forEach((stu) => {
  // 取该学生应学的 30 门课（基础 + 选修 + 通识）
  const studentCourses = courses
    .filter((c) => c.year <= 2024)
    .filter((c) => {
      // 简单分摊：每个学生取编号相关的课
      const hash = (parseInt(stu.id.slice(1)) + parseInt(c.id.slice(1))) % 3;
      return hash !== 0;
    });
  studentCourses.forEach((c) => {
    scoreCounter++;
    // 60% 概率有成绩（部分课未结课）
    if (Math.random() > 0.4) {
      // 真实一些：绩点影响分数分布，正态
      const base = 65 + random(0, 25);
      const bias =
        stu.major.includes('计算机') || stu.major.includes('软件')
          ? random(-5, 5)
          : random(-8, 3);
      const total = Math.max(0, Math.min(100, base + bias + random(-8, 8)));
      const usual = Math.max(0, Math.min(100, total + random(-10, 10)));
      const midterm = Math.max(0, Math.min(100, total + random(-12, 12)));
      const final = Math.max(0, Math.min(100, total + random(-8, 8)));
      const experiment =
        c.category === '实践'
          ? Math.max(0, Math.min(100, total + random(-6, 6)))
          : undefined;
      scores.push({
        id: `SC${pad(scoreCounter, 5)}`,
        studentId: stu.id,
        courseId: c.id,
        teacherId: c.teacherId,
        usual: c.category === '实践' ? usual : usual,
        midterm: c.category === '实践' ? undefined : midterm,
        final,
        experiment,
        total,
        gpa: scoreToGpa(total),
        level: getScoreLevel(total),
        examTime: `${c.year}-${c.semester === '春' ? '06' : '12'}-${pad(random(10, 28))}`,
        semester: c.semester,
        year: c.year,
        status: c.year < 2024 ? '已归档' : '已提交',
      });
    }
  });
});

// 通知
export const notifications: Notification[] = [
  {
    id: 'N001',
    userId: 'S0001',
    title: '【成绩发布】2024-秋 操作系统',
    content: '您的《操作系统》课程成绩已发布，总评 87 分。',
    type: '成绩发布',
    read: false,
    createdAt: '2025-01-15 10:30',
  },
  {
    id: 'N002',
    userId: 'S0001',
    title: '【成绩修改】2024-春 高等数学A',
    content: '您的《高等数学 A》成绩由 78 分修改为 82 分。',
    type: '成绩修改',
    read: false,
    createdAt: '2025-01-12 14:20',
  },
  {
    id: 'N003',
    userId: 'T001',
    title: '【审核结果】成绩修改申请已通过',
    content: '您提交的 S0023《数据结构》成绩修改申请已通过。',
    type: '审核结果',
    read: true,
    createdAt: '2025-01-10 09:00',
  },
  {
    id: 'N004',
    userId: 'A001',
    title: '【系统通知】本周开课提醒',
    content: '本学期共开设 236 门课程，请关注排课情况。',
    type: '系统通知',
    read: true,
    createdAt: '2025-01-08 08:00',
  },
];

// 成绩修改申请
export const scoreApplications: ScoreApplication[] = [
  {
    id: 'SA001',
    scoreId: scores[0]?.id ?? 'SC00001',
    teacherId: 'T001',
    reason: '平时分录入错误，重新核算后更正',
    oldTotal: 78,
    newTotal: 82,
    status: '待审核',
    createdAt: '2025-01-12 10:00',
  },
  {
    id: 'SA002',
    scoreId: scores[1]?.id ?? 'SC00002',
    teacherId: 'T002',
    reason: '学生申请复核，最终成绩漏统加分',
    oldTotal: 65,
    newTotal: 70,
    status: '待审核',
    createdAt: '2025-01-13 15:30',
  },
  {
    id: 'SA003',
    scoreId: scores[2]?.id ?? 'SC00003',
    teacherId: 'T003',
    reason: '实验报告补交',
    oldTotal: 80,
    newTotal: 85,
    status: '已通过',
    createdAt: '2025-01-08 09:00',
    handledAt: '2025-01-09 11:00',
    handlerId: 'A001',
    comment: '情况属实，同意修改。',
  },
];

// 注销申请
export const deregisterApplications: DeregisterApplication[] = [
  {
    id: 'DA001',
    studentId: 'S0105',
    reason: '个人原因申请注销账号',
    status: '待审核',
    createdAt: '2025-01-14 16:00',
  },
];

// 课程类别选项
export const courseCategories: CourseCategory[] = ['必修', '选修', '实践', '通识'];

// 学期选项（用于筛选）
export const semesterOptions = ['2023-春', '2023-秋', '2024-春', '2024-秋', '2025-春'];

// 工具：按课程号查询
export const courseById = (id: string) => courses.find((c) => c.id === id);
export const teacherById = (id: string) => teachers.find((t) => t.id === id);
export const studentById = (id: string) => students.find((s) => s.id === id);

// 当前登录用户（mock session）
const STORAGE_KEY = 'sas_current_user';

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function login(username: string, password: string): User | null {
  const all = [...admins, ...teachers, ...students];
  const user = all.find(
    (u) => u.username === username && u.password === password
  );
  if (user && user.status === '正常') {
    setCurrentUser(user);
    return user;
  }
  return null;
}

export function logout() {
  setCurrentUser(null);
}
