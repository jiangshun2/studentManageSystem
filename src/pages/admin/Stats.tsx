import { useMemo, useState } from 'react';
import { BarChart3, PieChart as PieIcon, Map, TrendingUp } from 'lucide-react';
import {
  scores,
  students,
  courses,
  majors,
  teachers,
  studentById,
  courseById,
} from '../../mock/data';
import { ContentBox, KpiCard, ChartCard } from '../../components/UI';
import Chart from '../../components/Chart';
import type { EChartsOption } from 'echarts';

export default function AdminStats() {
  const [dim, setDim] = useState<'major' | 'class' | 'teacher' | 'course'>('major');

  // 1. 各专业平均分
  const majorOption: EChartsOption = useMemo(() => {
    const data = majors.slice(0, 10).map((m) => {
      const stuIds = students.filter((s) => s.major === m).map((s) => s.id);
      const ss = scores.filter((s) => stuIds.includes(s.studentId));
      const avg = ss.length ? ss.reduce((a, s) => a + s.total, 0) / ss.length : 0;
      const pass = ss.length ? (ss.filter((s) => s.total >= 60).length / ss.length) * 100 : 0;
      const exc = ss.length ? (ss.filter((s) => s.total >= 90).length / ss.length) * 100 : 0;
      return { major: m, avg: Math.round(avg * 10) / 10, pass: Math.round(pass * 10) / 10, exc: Math.round(exc * 10) / 10 };
    });
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['平均分', '及格率(%)', '优秀率(%)'], top: 0 },
      grid: { left: 50, right: 30, top: 40, bottom: 60 },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.major),
        axisLabel: { rotate: 25, fontSize: 11 },
      },
      yAxis: [
        { type: 'value', name: '分数', min: 0, max: 100 },
        { type: 'value', name: '百分比', min: 0, max: 100 },
      ],
      series: [
        { name: '平均分', type: 'bar', data: data.map((d) => d.avg), itemStyle: { color: '#FF8200' }, barWidth: 18 },
        { name: '及格率(%)', type: 'line', yAxisIndex: 1, data: data.map((d) => d.pass), smooth: true, itemStyle: { color: '#52C41A' } },
        { name: '优秀率(%)', type: 'line', yAxisIndex: 1, data: data.map((d) => d.exc), smooth: true, itemStyle: { color: '#507DAF' } },
      ],
    };
  }, []);

  // 2. 班级对比雷达
  const classRadarOption: EChartsOption = useMemo(() => {
    return {
      tooltip: {},
      legend: { data: ['计算机1班', '计算机2班', '电信1班', '经管1班'], top: 0 },
      radar: {
        indicator: [
          { name: '平均分', max: 100 },
          { name: '及格率', max: 100 },
          { name: '优秀率', max: 100 },
          { name: '最高分', max: 100 },
          { name: '标准差(反向)', max: 100 },
          { name: '参考人数(对数)', max: 100 },
        ],
      },
      series: [
        {
          type: 'radar',
          data: [
            { name: '计算机1班', value: [84, 95, 38, 99, 88, 60], areaStyle: { color: 'rgba(255,130,0,0.3)' }, lineStyle: { color: '#FF8200' } },
            { name: '计算机2班', value: [82, 93, 35, 97, 86, 55], areaStyle: { color: 'rgba(82,196,26,0.3)' }, lineStyle: { color: '#52C41A' } },
            { name: '电信1班', value: [80, 92, 30, 98, 84, 50], areaStyle: { color: 'rgba(80,125,175,0.3)' }, lineStyle: { color: '#507DAF' } },
            { name: '经管1班', value: [78, 90, 25, 95, 82, 45], areaStyle: { color: 'rgba(114,46,209,0.3)' }, lineStyle: { color: '#722ED1' } },
          ],
        },
      ],
    };
  }, []);

  // 3. 教师对比散点
  const teacherScatterOption: EChartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => `${p.data[2]}<br/>平均分: ${p.data[0]}<br/>标准差: ${p.data[1]}<br/>学生数: ${p.data[3]}`,
      },
      grid: { left: 50, right: 30, top: 30, bottom: 40 },
      xAxis: { name: '平均分', type: 'value', min: 70, max: 90 },
      yAxis: { name: '标准差', type: 'value', min: 5, max: 20 },
      series: [
        {
          type: 'scatter',
          symbolSize: (v: any) => Math.sqrt(v[3]) / 2,
          data: teachers.slice(0, 20).map((t, i) => {
            const base = 80 + (i * 0.5);
            return [base, 8 + (i % 5) * 1.5, t.name, 60 + (i * 8)];
          }),
          itemStyle: {
            color: '#FF8200',
            opacity: 0.7,
            borderColor: '#fff',
            borderWidth: 1,
          },
          label: { show: true, formatter: (p: any) => p.data[2], position: 'top', fontSize: 9, color: '#666' },
        },
      ],
    };
  }, []);

  // 4. 课程箱线图（用柱状图+误差线模拟）
  const courseBoxOption: EChartsOption = useMemo(() => {
    const topCourses = courses.slice(0, 8);
    const data = topCourses.map((c) => {
      const ss = scores.filter((s) => s.courseId === c.id).map((s) => s.total);
      if (ss.length === 0) return [80, 80, 80, 80, 80, 80, 80];
      ss.sort((a, b) => a - b);
      const min = ss[0];
      const max = ss[ss.length - 1];
      const q1 = ss[Math.floor(ss.length * 0.25)];
      const q3 = ss[Math.floor(ss.length * 0.75)];
      const median = ss[Math.floor(ss.length * 0.5)];
      const mean = Math.round(ss.reduce((a, b) => a + b, 0) / ss.length);
      return [min, q1, median, q3, max, mean, c.id];
    });
    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => {
          const [min, q1, med, q3, max, mean, id] = p.value;
          const c = courseById(id);
          return `${c?.name}<br/>最低: ${min}<br/>Q1: ${q1}<br/>中位数: ${med}<br/>Q3: ${q3}<br/>最高: ${max}<br/>平均: ${mean}`;
        },
      },
      grid: { left: 50, right: 30, top: 30, bottom: 80 },
      xAxis: {
        type: 'category',
        data: topCourses.map((c) => c.name),
        axisLabel: { rotate: 30, fontSize: 11 },
      },
      yAxis: { type: 'value', min: 0, max: 100, name: '分数' },
      series: [
        {
          name: 'boxplot',
          type: 'boxplot',
          data: data.map((d) => [d[0], d[1], d[2], d[3], d[4]] as number[]),
          itemStyle: { color: 'rgba(255,130,0,0.3)', borderColor: '#FF8200' },
        },
        {
          name: '平均分',
          type: 'scatter',
          data: data.map((d) => d[5]),
          symbolSize: 10,
          itemStyle: { color: '#E14123' },
        },
      ],
    };
  }, []);

  return (
    <div>
      <ContentBox title="多维对比分析">
        <div className="flex-align-center" style={{ gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'major' as const, label: '专业对比', icon: <BarChart3 size={14} /> },
            { key: 'class' as const, label: '班级雷达', icon: <PieIcon size={14} /> },
            { key: 'teacher' as const, label: '教师散点', icon: <TrendingUp size={14} /> },
            { key: 'course' as const, label: '课程箱线', icon: <BarChart3 size={14} /> },
          ].map((d) => (
            <div
              key={d.key}
              onClick={() => setDim(d.key)}
              className="flex-align-center"
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: dim === d.key ? 'var(--w-brand)' : 'var(--w-border)',
                background: dim === d.key ? 'var(--w-hover)' : '#fff',
                color: dim === d.key ? 'var(--w-brand)' : 'var(--w-main)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: dim === d.key ? 600 : 400,
                gap: 6,
              }}
            >
              {d.icon}
              {d.label}
            </div>
          ))}
        </div>
      </ContentBox>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <KpiCard label="参评专业" value={majors.length} unit="个" />
        <KpiCard label="最高平均分" value="84.5" unit="分" />
        <KpiCard label="最低平均分" value="74.2" unit="分" />
        <KpiCard label="全校标准差" value="12.6" />
      </div>

      {dim === 'major' && (
        <ChartCard title="各专业成绩对比" extra="平均分 / 及格率 / 优秀率" height={420}>
          <Chart option={majorOption} height={420} />
        </ChartCard>
      )}
      {dim === 'class' && (
        <ChartCard title="班级综合维度对比" extra="六维评分" height={420}>
          <Chart option={classRadarOption} height={420} />
        </ChartCard>
      )}
      {dim === 'teacher' && (
        <ChartCard title="教师教学效果散点" extra="气泡=学生数" height={420}>
          <Chart option={teacherScatterOption} height={420} />
        </ChartCard>
      )}
      {dim === 'course' && (
        <ChartCard title="课程成绩分布箱线" extra="红点=平均分" height={420}>
          <Chart option={courseBoxOption} height={420} />
        </ChartCard>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          marginTop: 20,
        }}
      >
        <ContentBox title="课程类型分布">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: '必修课', count: 89, pct: 38, color: 'var(--w-brand)' },
              { label: '选修课', count: 65, pct: 28, color: 'var(--w-info)' },
              { label: '通识课', count: 45, pct: 19, color: 'var(--w-success)' },
              { label: '实践课', count: 35, pct: 15, color: 'var(--w-warning)' },
            ].map((c, i) => (
              <div key={i}>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>
                    {c.label} <span style={{ color: 'var(--w-sub)' }}>· {c.count}门</span>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.pct}%</span>
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
                      width: `${c.pct}%`,
                      height: '100%',
                      background: c.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ContentBox>

        <ContentBox title="学期成绩对比">
          <table className="woo-table">
            <thead>
              <tr>
                <th>学期</th>
                <th>考试人次</th>
                <th>平均分</th>
                <th>及格率</th>
                <th>优秀率</th>
              </tr>
            </thead>
            <tbody>
              {[
                { term: '2024 秋', count: 6850, avg: 79.5, pass: 93.5, exc: 22.1 },
                { term: '2024 春', count: 6420, avg: 78.2, pass: 92.0, exc: 19.8 },
                { term: '2023 秋', count: 6080, avg: 80.1, pass: 94.2, exc: 24.5 },
                { term: '2023 春', count: 5750, avg: 79.8, pass: 93.8, exc: 23.0 },
              ].map((t, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{t.term}</td>
                  <td>{t.count.toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: 'var(--w-brand)' }}>{t.avg}</td>
                  <td>{t.pass}%</td>
                  <td>{t.exc}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ContentBox>
      </div>
    </div>
  );
}
