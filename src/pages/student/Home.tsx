import { Link } from 'react-router-dom';
import { Award, BookOpen, TrendingUp, Calendar, ArrowRight, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { scores, courseById, teacherById, studentById, getScoreLevel, scoreToGpa } from '../../mock/data';
import { ContentBox, KpiCard, ChartCard } from '../../components/UI';
import Chart from '../../components/Chart';
import type { EChartsOption } from 'echarts';

export default function StudentHome() {
  const { user } = useAuth();
  if (!user || user.role !== 'student') return null;
  const stu = studentById(user.id)!;

  const myScores = scores.filter((s) => s.studentId === user.id);
  const totalCredits = myScores.reduce((acc, s) => {
    const c = courseById(s.courseId);
    return acc + (c?.credits ?? 0);
  }, 0);
  const avgScore = myScores.length
    ? myScores.reduce((a, s) => a + s.total, 0) / myScores.length
    : 0;
  const avgGpa = myScores.length
    ? myScores.reduce((a, s) => a + s.gpa, 0) / myScores.length
    : 0;
  const excellentCount = myScores.filter((s) => s.level === '优秀').length;

  // 最近 5 门成绩
  const recent = [...myScores]
    .sort((a, b) => b.examTime.localeCompare(a.examTime))
    .slice(0, 5);

  // 等级分布
  const levelMap: Record<string, number> = {
    优秀: 0, 良好: 0, 中等: 0, 及格: 0, 不及格: 0,
  };
  myScores.forEach((s) => (levelMap[s.level] += 1));
  const pieOption: EChartsOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, icon: 'circle' },
    series: [
      {
        name: '成绩分布',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          { value: levelMap['优秀'], name: '优秀', itemStyle: { color: '#52C41A' } },
          { value: levelMap['良好'], name: '良好', itemStyle: { color: '#FFB800' } },
          { value: levelMap['中等'], name: '中等', itemStyle: { color: '#FF8200' } },
          { value: levelMap['及格'], name: '及格', itemStyle: { color: '#FAAD14' } },
          { value: levelMap['不及格'], name: '不及格', itemStyle: { color: '#E14123' } },
        ],
      },
    ],
  };

  return (
    <div>
      <div className="content-box" style={{ background: 'linear-gradient(135deg, #FF8200 0%, #FF5900 100%)', color: '#fff' }}>
        <div className="flex-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>下午好，{stu.name} 同学</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>
              欢迎回到学籍成绩管理系统
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>
              {stu.major} · {stu.className} · {stu.enrollmentYear} 级 · 学号 {stu.studentNo}
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
              fontSize: 36,
            }}
          >
            <GraduationCap size={42} />
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
        <KpiCard
          label="已修学分"
          value={totalCredits}
          unit={`/ ${stu.totalCreditsRequired}`}
          icon={<BookOpen size={20} />}
          trend={{ value: 12.5, label: '较上学期' }}
        />
        <KpiCard
          label="课程数"
          value={myScores.length}
          unit="门"
          icon={<Award size={20} />}
        />
        <KpiCard
          label="平均成绩"
          value={avgScore.toFixed(1)}
          unit="分"
          icon={<TrendingUp size={20} />}
          trend={{ value: 2.3, label: '较上学期' }}
        />
        <KpiCard
          label="平均绩点"
          value={avgGpa.toFixed(2)}
          unit="/ 4.0"
          icon={<Award size={20} />}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
        }}
      >
        <ContentBox
          title={
            <div className="flex-between" style={{ width: '100%' }}>
              <span>最近成绩</span>
              <Link
                to="/student/score"
                style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 2 }}
              >
                查看全部 <ArrowRight size={12} />
              </Link>
            </div>
          }
        >
          {recent.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--w-sub)' }}>
              暂无成绩记录
            </div>
          ) : (
            <table className="woo-table">
              <thead>
                <tr>
                  <th>课程</th>
                  <th>学分</th>
                  <th>成绩</th>
                  <th>等级</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => {
                  const c = courseById(s.courseId);
                  return (
                    <tr key={s.id}>
                      <td>{c?.name ?? '-'}</td>
                      <td>{c?.credits ?? '-'}</td>
                      <td style={{ fontWeight: 600, color: s.total >= 60 ? 'var(--w-main)' : 'var(--w-special)' }}>
                        {s.total}
                      </td>
                      <td>
                        <span
                          className={
                            'woo-tag ' +
                            (s.level === '优秀' ? 'woo-tag-success' :
                              s.level === '良好' ? 'woo-tag-warning' :
                              s.level === '中等' ? 'woo-tag-primary' :
                              s.level === '及格' ? 'woo-tag-info' : 'woo-tag-danger')
                          }
                        >
                          {s.level}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </ContentBox>

        <ChartCard title="成绩等级分布" height={300}>
          <Chart option={pieOption} height={300} />
        </ChartCard>
      </div>

      <ContentBox title="学业进展">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {[
            { label: '已获学分', value: totalCredits, target: stu.totalCreditsRequired, color: 'var(--w-brand)' },
            { label: '必修学分', value: myScores.filter(s => courseById(s.courseId)?.category === '必修').reduce((a, s) => a + (courseById(s.courseId)?.credits ?? 0), 0), target: 80, color: 'var(--w-success)' },
            { label: '选修学分', value: myScores.filter(s => courseById(s.courseId)?.category === '选修').reduce((a, s) => a + (courseById(s.courseId)?.credits ?? 0), 0), target: 30, color: 'var(--w-info)' },
          ].map((p, i) => {
            const pct = Math.min(100, (p.value / p.target) * 100);
            return (
              <div key={i}>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{p.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--w-sub)' }}>
                    {p.value} / {p.target}
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: '#f0f1f4',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: p.color,
                      transition: 'width 0.6s',
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: 'var(--w-sub)', marginTop: 4 }}>
                  完成度 {pct.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </ContentBox>
    </div>
  );
}
