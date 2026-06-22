import { useMemo, useState } from 'react';
import { BarChart3, PieChart as PieIcon, TrendingUp, Activity, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  courses,
  scores as allScores,
  courseById,
  studentById,
  teacherById,
} from '../../mock/data';
import { ContentBox, KpiCard, ChartCard } from '../../components/UI';
import Chart from '../../components/Chart';
import type { EChartsOption } from 'echarts';

export default function TeacherAnalytics() {
  const { user } = useAuth();
  if (!user || user.role !== 'teacher') return null;

  const myCourses = useMemo(
    () => courses.filter((c) => c.teacherId === user.id && c.year === 2024),
    [user]
  );

  const [selectedId, setSelectedId] = useState(myCourses[0]?.id ?? '');
  const selected = courseById(selectedId);
  const myScores = useMemo(
    () => allScores.filter((s) => s.teacherId === user.id && s.courseId === selectedId),
    [user, selectedId]
  );

  // 1. 成绩分布柱状图
  const distOption: EChartsOption = useMemo(() => {
    const buckets = [
      { name: '0-59 不及格', min: 0, max: 59 },
      { name: '60-69 及格', min: 60, max: 69 },
      { name: '70-79 中等', min: 70, max: 79 },
      { name: '80-89 良好', min: 80, max: 89 },
      { name: '90-100 优秀', min: 90, max: 100 },
    ];
    const data = buckets.map((b) => ({
      name: b.name,
      value: myScores.filter((s) => s.total >= b.min && s.total <= b.max).length,
    }));
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 50, right: 30, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: data.map((d) => d.name) },
      yAxis: { type: 'value', name: '人数' },
      series: [
        {
          type: 'bar',
          data: data.map((d, i) => ({
            value: d.value,
            itemStyle: {
              color: ['#E14123', '#FAAD14', '#FF8200', '#FFB800', '#52C41A'][i],
              borderRadius: [4, 4, 0, 0],
            },
          })),
          barWidth: 36,
          label: { show: true, position: 'top' },
        },
      ],
    };
  }, [myScores]);

  // 2. 等级饼图
  const levelOption: EChartsOption = useMemo(() => {
    const map: Record<string, number> = { 优秀: 0, 良好: 0, 中等: 0, 及格: 0, 不及格: 0 };
    myScores.forEach((s) => (map[s.level] += 1));
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, icon: 'circle' },
      series: [
        {
          name: '成绩等级',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
          data: [
            { value: map['优秀'], name: '优秀', itemStyle: { color: '#52C41A' } },
            { value: map['良好'], name: '良好', itemStyle: { color: '#FFB800' } },
            { value: map['中等'], name: '中等', itemStyle: { color: '#FF8200' } },
            { value: map['及格'], name: '及格', itemStyle: { color: '#FAAD14' } },
            { value: map['不及格'], name: '不及格', itemStyle: { color: '#E14123' } },
          ],
        },
      ],
    };
  }, [myScores]);

  // 3. 学生排名
  const rankOption: EChartsOption = useMemo(() => {
    const sorted = [...myScores].sort((a, b) => b.total - a.total).slice(0, 15);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 90, right: 40, top: 20, bottom: 30 },
      xAxis: { type: 'value', max: 100 },
      yAxis: {
        type: 'category',
        data: sorted.reverse().map((s) => studentById(s.studentId)?.name ?? ''),
        axisLabel: { fontSize: 11 },
      },
      series: [
        {
          type: 'bar',
          data: sorted.map((s) => ({
            value: s.total,
            itemStyle: {
              color:
                s.total >= 90
                  ? '#52C41A'
                  : s.total >= 80
                  ? '#FFB800'
                  : s.total >= 70
                  ? '#FF8200'
                  : s.total >= 60
                  ? '#FAAD14'
                  : '#E14123',
            },
          })),
          barWidth: 14,
          label: { show: true, position: 'right', fontSize: 11 },
          markLine: {
            symbol: 'none',
            data: [{ xAxis: 60, label: { formatter: '及格线' } }],
            lineStyle: { color: '#E14123', type: 'dashed' },
          },
        },
      ],
    };
  }, [myScores]);

  // 4. 历届成绩趋势
  const trendOption: EChartsOption = useMemo(() => {
    const teacherCourses = courses.filter((c) => c.teacherId === user.id);
    const data = [2023, 2024].map((y) => {
      const cIds = teacherCourses.filter((c) => c.year === y).map((c) => c.id);
      const ss = allScores.filter((s) => cIds.includes(s.courseId));
      const avg = ss.length ? ss.reduce((a, s) => a + s.total, 0) / ss.length : 0;
      return { year: y, value: Math.round(avg * 10) / 10 };
    });
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 50, right: 30, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: data.map((d) => `${d.year} 年`) },
      yAxis: { type: 'value', min: 60, max: 90 },
      series: [
        {
          type: 'line',
          data: data.map((d) => d.value),
          smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: { color: '#FF8200' },
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255,130,0,0.4)' },
                { offset: 1, color: 'rgba(255,130,0,0.02)' },
              ],
            },
          },
          label: { show: true, position: 'top' },
        },
      ],
    };
  }, [user]);

  // 统计
  const avg = myScores.length
    ? myScores.reduce((a, s) => a + s.total, 0) / myScores.length
    : 0;
  const passRate = myScores.length
    ? (myScores.filter((s) => s.total >= 60).length / myScores.length) * 100
    : 0;
  const excellentRate = myScores.length
    ? (myScores.filter((s) => s.total >= 90).length / myScores.length) * 100
    : 0;
  const maxScore = myScores.length ? Math.max(...myScores.map((s) => s.total)) : 0;
  const minScore = myScores.length ? Math.min(...myScores.map((s) => s.total)) : 0;

  // 标准差
  const std = myScores.length
    ? Math.sqrt(
        myScores.reduce((acc, s) => acc + Math.pow(s.total - avg, 2), 0) / myScores.length
      )
    : 0;

  return (
    <div>
      <ContentBox title="选择课程查看分析">
        <div className="flex-align-center" style={{ gap: 8, flexWrap: 'wrap' }}>
          {myCourses.slice(0, 6).map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="flex-align-center"
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: selectedId === c.id ? 'var(--w-brand)' : 'var(--w-border)',
                background: selectedId === c.id ? 'var(--w-hover)' : '#fff',
                color: selectedId === c.id ? 'var(--w-brand)' : 'var(--w-main)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: selectedId === c.id ? 600 : 400,
              }}
            >
              {c.name}
            </div>
          ))}
        </div>
      </ContentBox>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <KpiCard label="参考人数" value={myScores.length} unit="人" icon={<Activity size={20} />} />
        <KpiCard label="平均分" value={avg.toFixed(1)} unit="分" icon={<BarChart3 size={20} />} />
        <KpiCard label="及格率" value={passRate.toFixed(1)} unit="%" icon={<TrendingUp size={20} />} />
        <KpiCard label="优秀率" value={excellentRate.toFixed(1)} unit="%" icon={<Award size={20} />} />
        <KpiCard label="标准差" value={std.toFixed(2)} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          marginBottom: 20,
        }}
      >
        <ChartCard title="成绩分布" extra="按分数段">
          <Chart option={distOption} height={320} />
        </ChartCard>
        <ChartCard title="成绩等级占比" extra="5 级分布">
          <Chart option={levelOption} height={320} />
        </ChartCard>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 20,
        }}
      >
        <ChartCard title="学生成绩排名" extra="TOP 15">
          <Chart option={rankOption} height={360} />
        </ChartCard>
        <ChartCard title="历届成绩趋势" extra="近 2 年">
          <Chart option={trendOption} height={360} />
        </ChartCard>
      </div>
    </div>
  );
}
