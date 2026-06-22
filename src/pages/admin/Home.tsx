import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Monitor,
} from 'lucide-react';
import {
  students,
  teachers,
  courses,
  scores,
  scoreApplications,
  deregisterApplications,
  courseById,
} from '../../mock/data';
import { ContentBox, KpiCard, ChartCard } from '../../components/UI';
import Chart from '../../components/Chart';
import type { EChartsOption } from 'echarts';

export default function AdminHome() {
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalCourses = courses.length;
  const totalScores = scores.length;

  // 待审核数量
  const pendingApps = scoreApplications.filter((a) => a.status === '待审核').length;
  const pendingDereg = deregisterApplications.filter((a) => a.status === '待审核').length;

  // 近 5 年学生数变化
  const trendOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { top: 0 },
    grid: { left: 50, right: 30, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: ['2020', '2021', '2022', '2023', '2024', '2025'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '在校学生',
        type: 'line',
        smooth: true,
        data: [22000, 23500, 25200, 26800, 27900, 28560],
        itemStyle: { color: '#FF8200' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255,130,0,0.3)' },
              { offset: 1, color: 'rgba(255,130,0,0)' },
            ],
          },
        },
      },
      {
        name: '在职教师',
        type: 'line',
        smooth: true,
        data: [1200, 1320, 1450, 1580, 1720, 1850],
        itemStyle: { color: '#507DAF' },
        lineStyle: { width: 3 },
      },
    ],
  };

  // 院系分布
  const deptOption: EChartsOption = {
    tooltip: { trigger: 'item' },
    legend: { type: 'scroll', orient: 'vertical', right: 10, top: 'middle', textStyle: { fontSize: 11 } },
    series: [
      {
        name: '院系学生分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          { value: 4200, name: '计算机学院', itemStyle: { color: '#FF8200' } },
          { value: 3600, name: '电信学院', itemStyle: { color: '#E14123' } },
          { value: 3200, name: '机械学院', itemStyle: { color: '#52C41A' } },
          { value: 2900, name: '经管学院', itemStyle: { color: '#507DAF' } },
          { value: 2400, name: '外国语学院', itemStyle: { color: '#FFB800' } },
          { value: 2100, name: '数学学院', itemStyle: { color: '#722ED1' } },
          { value: 1900, name: '物理光电', itemStyle: { color: '#13C2C2' } },
          { value: 1700, name: '化工学院', itemStyle: { color: '#FAAD14' } },
          { value: 1500, name: '生命科学', itemStyle: { color: '#EB2F96' } },
          { value: 1300, name: '马克思主义', itemStyle: { color: '#2F54EB' } },
        ],
      },
    ],
  };

  return (
    <div>
      <div
        className="content-box"
        style={{
          background: 'linear-gradient(135deg, #52C41A 0%, #389E0D 100%)',
          color: '#fff',
        }}
      >
        <div className="flex-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>系统管理员</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>
              欢迎使用学籍成绩管理系统
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>
              当前系统运行正常 · 今日处理申请 {pendingApps + pendingDereg} 条
            </div>
          </div>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserCheck size={42} />
          </div>
        </div>
        <div className="flex-align-center" style={{ gap: 12, marginTop: 20 }}>
          <Link
            to="/admin/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              borderRadius: 18,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <Monitor size={14} />
            进入数据大屏
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <KpiCard label="在校学生" value={totalStudents.toLocaleString()} unit="人" icon={<GraduationCap size={20} />} trend={{ value: 3.2, label: '同比' }} />
        <KpiCard label="在职教师" value={totalTeachers.toLocaleString()} unit="人" icon={<Users size={20} />} trend={{ value: 5.1, label: '同比' }} />
        <KpiCard label="课程总数" value={totalCourses.toLocaleString()} unit="门" icon={<BookOpen size={20} />} />
        <KpiCard label="成绩记录" value={totalScores.toLocaleString()} unit="条" icon={<Award size={20} />} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          marginBottom: 20,
        }}
      >
        <ChartCard title="师生规模趋势" extra="近 6 年">
          <Chart option={trendOption} height={300} />
        </ChartCard>
        <ChartCard title="院系学生分布" extra="当前">
          <Chart option={deptOption} height={300} />
        </ChartCard>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
        }}
      >
        <ContentBox title="待办审批">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: <AlertCircle size={18} color="var(--w-warning)" />, label: '成绩修改申请', count: pendingApps, link: '/admin/scores' },
              { icon: <AlertCircle size={18} color="var(--w-special)" />, label: '账号注销申请', count: pendingDereg, link: '/admin/users' },
              { icon: <TrendingUp size={18} color="var(--w-info)" />, label: '课程开设审核', count: 5, link: '/admin/courses' },
              { icon: <BookOpen size={18} color="var(--w-success)" />, label: '教学资料备案', count: 3, link: '/admin/courses' },
            ].map((t, i) => (
              <Link
                key={i}
                to={t.link}
                className="flex-between"
                style={{
                  padding: 14,
                  background: '#FAFAFA',
                  borderRadius: 6,
                  color: 'var(--w-main)',
                }}
              >
                <div className="flex-align-center" style={{ gap: 10 }}>
                  {t.icon}
                  <span style={{ fontSize: 14 }}>{t.label}</span>
                </div>
                <span
                  style={{
                    background: 'var(--w-brand)',
                    color: '#fff',
                    borderRadius: 10,
                    padding: '2px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {t.count}
                </span>
              </Link>
            ))}
          </div>
        </ContentBox>

        <ContentBox title="最近成绩活动">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scores.slice(0, 5).map((s) => {
              const c = courseById(s.courseId);
              return (
                <div
                  key={s.id}
                  className="flex-between"
                  style={{
                    padding: 10,
                    background: '#FAFAFA',
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{c?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--w-sub)', marginTop: 2 }}>
                      {s.year} {s.semester} · {s.total} 分
                    </div>
                  </div>
                  <span className="woo-tag">{s.status}</span>
                </div>
              );
            })}
          </div>
        </ContentBox>
      </div>
    </div>
  );
}
