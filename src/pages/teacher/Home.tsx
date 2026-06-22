import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, TrendingUp, ArrowRight, Edit3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  courses,
  scores,
  courseById,
  studentById,
  teacherById,
} from '../../mock/data';
import { ContentBox, KpiCard, ChartCard } from '../../components/UI';
import Chart from '../../components/Chart';
import type { EChartsOption } from 'echarts';

export default function TeacherHome() {
  const { user } = useAuth();
  if (!user || user.role !== 'teacher') return null;
  const teacher = teacherById(user.id)!;

  const myCourses = courses.filter((c) => c.teacherId === user.id);
  const myScores = scores.filter((s) => s.teacherId === user.id);
  const myStudentIds = new Set(myScores.map((s) => s.studentId));
  const avgScore = myScores.length
    ? myScores.reduce((a, s) => a + s.total, 0) / myScores.length
    : 0;

  // 本学期课程
  const currentTermCourses = myCourses.filter((c) => c.year === 2024);

  // 课程成绩分布
  const distOption: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 50, right: 30, top: 30, bottom: 50 },
    xAxis: {
      type: 'category',
      data: currentTermCourses.slice(0, 6).map((c) => c.name),
      axisLabel: { rotate: 30, fontSize: 11 },
    },
    yAxis: { type: 'value', name: '平均分', min: 0, max: 100 },
    series: [
      {
        type: 'bar',
        data: currentTermCourses.slice(0, 6).map((c) => {
          const sc = myScores.filter((s) => s.courseId === c.id);
          const avg = sc.length ? sc.reduce((a, s) => a + s.total, 0) / sc.length : 0;
          return Math.round(avg);
        }),
        barWidth: 24,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#FFB800' },
              { offset: 1, color: '#FF8200' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        label: { show: true, position: 'top', fontSize: 11 },
      },
    ],
  };

  return (
    <div>
      <div
        className="content-box"
        style={{
          background: 'linear-gradient(135deg, #507DAF 0%, #2B5C95 100%)',
          color: '#fff',
        }}
      >
        <div className="flex-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>
              {teacher.title} · {teacher.department}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>
              欢迎，{teacher.name} 老师
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>
              本学期共教授 {currentTermCourses.length} 门课程，累计学生 {myStudentIds.size} 人
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
            <BookOpen size={42} />
          </div>
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
        <KpiCard label="本学期课程" value={currentTermCourses.length} unit="门" icon={<BookOpen size={20} />} />
        <KpiCard label="累计学生" value={myStudentIds.size} unit="人" icon={<Users size={20} />} />
        <KpiCard label="总成绩记录" value={myScores.length} unit="条" icon={<Award size={20} />} />
        <KpiCard label="平均分" value={avgScore.toFixed(1)} unit="分" icon={<TrendingUp size={20} />} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 20,
          marginBottom: 20,
        }}
      >
        <ChartCard title="本学期课程平均分" height={300}>
          <Chart option={distOption} height={300} />
        </ChartCard>
        <ContentBox title="待办事项">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { type: '待录入', count: 3, color: 'var(--w-warning)', text: '门课程待录入成绩' },
              { type: '待审核', count: 2, color: 'var(--w-info)', text: '条成绩修改申请' },
              { type: '待发布', count: 1, color: 'var(--w-brand)', text: '门课程公告待发布' },
            ].map((t, i) => (
              <div
                key={i}
                className="flex-between"
                style={{
                  padding: 12,
                  background: '#FAFAFA',
                  borderRadius: 6,
                }}
              >
                <div className="flex-align-center" style={{ gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: t.color,
                    }}
                  />
                  <span style={{ fontSize: 13 }}>{t.text}</span>
                </div>
                <span
                  style={{
                    background: t.color,
                    color: '#fff',
                    borderRadius: 10,
                    padding: '0 8px',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {t.count}
                </span>
              </div>
            ))}
          </div>
        </ContentBox>
      </div>

      <ContentBox
        title={
          <div className="flex-between" style={{ width: '100%' }}>
            <span>本学期所授课程</span>
            <Link
              to="/teacher/course"
              style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 2 }}
            >
              查看全部 <ArrowRight size={12} />
            </Link>
          </div>
        }
      >
        <table className="woo-table">
          <thead>
            <tr>
              <th>课程号</th>
              <th>课程名</th>
              <th>学分</th>
              <th>类别</th>
              <th>学期</th>
              <th>已选/容量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {currentTermCourses.slice(0, 8).map((c) => (
              <tr key={c.id}>
                <td style={{ color: 'var(--w-sub)', fontSize: 12 }}>{c.courseNo}</td>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td>{c.credits}</td>
                <td>
                  <span
                    className={
                      'woo-tag ' +
                      (c.category === '必修'
                        ? 'woo-tag-primary'
                        : c.category === '选修'
                        ? 'woo-tag-info'
                        : c.category === '实践'
                        ? 'woo-tag-warning'
                        : '')
                    }
                  >
                    {c.category}
                  </span>
                </td>
                <td>{c.year} {c.semester}</td>
                <td>
                  <span style={{ color: c.selected > c.capacity ? 'var(--w-special)' : 'var(--w-main)' }}>
                    {c.selected} / {c.capacity}
                  </span>
                </td>
                <td>
                  <Link
                    to="/teacher/score"
                    style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Edit3 size={12} />
                    录入成绩
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ContentBox>
    </div>
  );
}
