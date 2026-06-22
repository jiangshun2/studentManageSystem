import { useMemo } from 'react';
import { TrendingUp, Radar as RadarIcon, BarChart3, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  scores,
  courseById,
  CourseCategory,
} from '../../mock/data';
import { ContentBox, ChartCard, KpiCard } from '../../components/UI';
import Chart from '../../components/Chart';
import type { EChartsOption } from 'echarts';

export default function StudentVisual() {
  const { user } = useAuth();
  if (!user || user.role !== 'student') return null;

  const myScores = useMemo(
    () => scores.filter((s) => s.studentId === user.id),
    [user]
  );

  // 1. 个人成绩趋势
  const trendOption: EChartsOption = useMemo(() => {
    const sorted = [...myScores].sort((a, b) => a.examTime.localeCompare(b.examTime));
    const xData = sorted.map((s) => `${s.year}-${s.semester}`);
    const scoresData = sorted.map((s) => s.total);
    const gpaData = sorted.map((s) => s.gpa * 25); // 缩放到 0-100 区间对比
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['成绩', '绩点 (×25)'], top: 0 },
      grid: { left: 40, right: 30, top: 40, bottom: 50 },
      xAxis: { type: 'category', data: xData, axisLabel: { rotate: 30 } },
      yAxis: { type: 'value', max: 100, splitLine: { lineStyle: { color: '#f0f0f0' } } },
      dataZoom: [{ type: 'inside' }, { type: 'slider', height: 18, bottom: 5 }],
      series: [
        {
          name: '成绩',
          type: 'line',
          data: scoresData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
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
          markLine: { data: [{ yAxis: 60, name: '及格线', label: { formatter: '及格线 60' }, lineStyle: { color: '#E14123', type: 'dashed' } }] },
        },
        {
          name: '绩点 (×25)',
          type: 'line',
          data: gpaData,
          smooth: true,
          itemStyle: { color: '#507DAF' },
          lineStyle: { width: 2, type: 'dotted' },
        },
      ],
    };
  }, [myScores]);

  // 2. 能力雷达 - 按类别
  const radarOption: EChartsOption = useMemo(() => {
    const categories: CourseCategory[] = ['必修', '选修', '实践', '通识'];
    const indicators = categories.map((cat) => {
      const list = myScores.filter((s) => courseById(s.courseId)?.category === cat);
      const avg = list.length ? list.reduce((a, s) => a + s.total, 0) / list.length : 0;
      return { name: cat, max: 100 };
    });
    const values = categories.map((cat) => {
      const list = myScores.filter((s) => courseById(s.courseId)?.category === cat);
      return list.length
        ? Math.round(list.reduce((a, s) => a + s.total, 0) / list.length)
        : 0;
    });
    return {
      tooltip: {},
      radar: {
        indicator: indicators,
        shape: 'polygon',
        splitArea: { areaStyle: { color: ['rgba(255,130,0,0.02)', 'rgba(255,130,0,0.05)'] } },
        axisName: { color: '#666', fontSize: 13 },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              name: '能力维度',
              value: values,
              areaStyle: { color: 'rgba(255,130,0,0.3)' },
              lineStyle: { color: '#FF8200', width: 2 },
              itemStyle: { color: '#FF8200' },
            },
          ],
        },
      ],
    };
  }, [myScores]);

  // 3. 学分进度
  const totalRequired = 160;
  const earnedCredits = myScores.reduce(
    (acc, s) => acc + (courseById(s.courseId)?.credits ?? 0),
    0
  );
  const requiredCredits = myScores
    .filter((s) => courseById(s.courseId)?.category === '必修')
    .reduce((acc, s) => acc + (courseById(s.courseId)?.credits ?? 0), 0);
  const electiveCredits = myScores
    .filter((s) => courseById(s.courseId)?.category === '选修')
    .reduce((acc, s) => acc + (courseById(s.courseId)?.credits ?? 0), 0);

  const progressOption: EChartsOption = {
    series: [
      {
        type: 'pie',
        radius: ['55%', '75%'],
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          { value: requiredCredits, name: '必修', itemStyle: { color: '#FF8200' } },
          { value: electiveCredits, name: '选修', itemStyle: { color: '#507DAF' } },
          { value: Math.max(0, totalRequired - earnedCredits), name: '未修', itemStyle: { color: '#f0f0f0' } },
        ],
      },
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '38%',
        style: {
          text: `${Math.round((earnedCredits / totalRequired) * 100)}%`,
          fontSize: 28,
          fontWeight: 700,
          fill: '#FF8200',
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '52%',
        style: {
          text: `${earnedCredits} / ${totalRequired} 学分`,
          fontSize: 12,
          fill: '#939393',
        },
      },
    ],
    tooltip: { trigger: 'item', formatter: '{b}: {c} 学分 ({d}%)' },
  };

  // 4. 散点图 - 课程相关性
  const scatterOption: EChartsOption = useMemo(() => {
    const data = myScores.map((s) => {
      const c = courseById(s.courseId);
      return {
        name: c?.name ?? '',
        value: [c?.credits ?? 0, s.total, c?.hours ?? 0, s.level],
      };
    });
    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => {
          const [x, y, , level] = p.value;
          return `${p.name}<br/>学分: ${x}<br/>成绩: ${y}<br/>等级: ${level}`;
        },
      },
      grid: { left: 50, right: 30, top: 30, bottom: 40 },
      xAxis: { name: '学分', type: 'value', min: 0 },
      yAxis: { name: '成绩', type: 'value', min: 0, max: 100 },
      series: [
        {
          type: 'scatter',
          data,
          symbolSize: (v: any) => Math.max(10, v[2] / 4),
          itemStyle: {
            color: (params: any) => {
              const score = params.value[1];
              if (score >= 90) return '#52C41A';
              if (score >= 80) return '#FFB800';
              if (score >= 70) return '#FF8200';
              if (score >= 60) return '#FAAD14';
              return '#E14123';
            },
            opacity: 0.75,
          },
        },
      ],
    };
  }, [myScores]);

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <KpiCard label="总课程数" value={myScores.length} unit="门" icon={<BarChart3 size={20} />} />
        <KpiCard label="已获学分" value={earnedCredits} unit={`/ ${totalRequired}`} icon={<Target size={20} />} />
        <KpiCard
          label="平均成绩"
          value={
            myScores.length
              ? (myScores.reduce((a, s) => a + s.total, 0) / myScores.length).toFixed(1)
              : 0
          }
          unit="分"
          icon={<TrendingUp size={20} />}
        />
        <KpiCard
          label="最高分"
          value={myScores.length ? Math.max(...myScores.map((s) => s.total)) : 0}
          unit="分"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 20,
          marginBottom: 20,
        }}
      >
        <ChartCard title="个人成绩趋势" extra="按学期">
          <Chart option={trendOption} height={360} />
        </ChartCard>
        <ChartCard title="能力维度雷达" extra="按课程类别">
          <Chart option={radarOption} height={360} />
        </ChartCard>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: 20,
        }}
      >
        <ChartCard title="学分完成进度" extra="培养方案要求">
          <Chart option={progressOption} height={320} />
        </ChartCard>
        <ChartCard title="课程成绩分布" extra="气泡大小=课时">
          <Chart option={scatterOption} height={320} />
        </ChartCard>
      </div>
    </div>
  );
}
