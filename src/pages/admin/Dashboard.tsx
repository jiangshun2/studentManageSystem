import { useEffect, useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Activity,
  Award,
  AlertCircle,
  Monitor,
  Map,
} from 'lucide-react';
import {
  students,
  teachers,
  courses,
  scores,
  courseById,
  teacherById,
} from '../../mock/data';
import { KpiCard, ChartCard } from '../../components/UI';
import Chart from '../../components/Chart';
import type { EChartsOption } from 'echarts';

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function AdminDashboard() {
  const now = useNow();
  const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
  const dateStr = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  });

  // 1. 全校成绩分布（双图：饼图 + 柱状图）
  const distOption: EChartsOption = useMemo(() => {
    const map: Record<string, number> = { 优秀: 0, 良好: 0, 中等: 0, 及格: 0, 不及格: 0 };
    scores.forEach((s) => (map[s.level] += 1));
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, icon: 'circle', textStyle: { color: '#fff' } },
      series: [
        {
          name: '成绩等级',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          label: { show: true, color: '#fff', formatter: '{b}\n{d}%', fontSize: 11 },
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
  }, []);

  // 2. 分数段柱状图
  const bucketOption: EChartsOption = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, i) => ({
      min: i * 10,
      max: i * 10 + 9,
      name: `${i * 10}-${i * 10 + 9}`,
    }));
    buckets.push({ min: 100, max: 100, name: '100' });
    const data = buckets.map((b) => ({
      name: b.name,
      value: scores.filter((s) => s.total >= b.min && s.total <= b.max).length,
    }));
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.name),
        axisLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'rgba(255,255,255,0.7)' },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.value),
          barWidth: 16,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#00E5FF' },
                { offset: 1, color: '#0077B6' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };
  }, []);

  // 3. 院系排行 TOP10
  const rankOption: EChartsOption = useMemo(() => {
    const data = [
      { name: '计算机学院', value: 84.5 },
      { name: '电信学院', value: 82.3 },
      { name: '数学学院', value: 81.7 },
      { name: '物理光电', value: 80.5 },
      { name: '经管学院', value: 79.8 },
      { name: '机械学院', value: 78.2 },
      { name: '化工学院', value: 77.6 },
      { name: '生命科学', value: 76.9 },
      { name: '外国语学院', value: 75.4 },
      { name: '马克思主义', value: 74.2 },
    ];
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 100, right: 60, top: 10, bottom: 20 },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: 'rgba(255,255,255,0.7)' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.name).reverse(),
        axisLabel: { color: '#fff', fontSize: 11 },
        axisLine: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: data.reverse().map((d, i) => ({
            value: d.value,
            itemStyle: {
              color: i < 3 ? '#FFB800' : '#FF8200',
              borderRadius: [0, 4, 4, 0],
            },
          })),
          barWidth: 14,
          label: {
            show: true,
            position: 'right',
            color: '#fff',
            formatter: '{c}',
            fontSize: 11,
          },
        },
      ],
    };
  }, []);

  // 4. 历届成绩趋势
  const trendOption: EChartsOption = useMemo(() => {
    return {
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['全校平均', '计算机', '电信', '经管'],
        top: 0,
        textStyle: { color: '#fff' },
      },
      grid: { left: 50, right: 30, top: 40, bottom: 30 },
      xAxis: {
        type: 'category',
        data: ['2020', '2021', '2022', '2023', '2024', '2025'],
        axisLabel: { color: 'rgba(255,255,255,0.7)' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      },
      yAxis: {
        type: 'value',
        min: 70,
        max: 90,
        axisLabel: { color: 'rgba(255,255,255,0.7)' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      },
      series: [
        { name: '全校平均', type: 'line', data: [78.2, 79.0, 79.5, 80.1, 78.5, 79.8], smooth: true, itemStyle: { color: '#00E5FF' }, lineStyle: { width: 3 } },
        { name: '计算机', type: 'line', data: [82.0, 82.5, 83.2, 84.0, 84.5, 85.1], smooth: true, itemStyle: { color: '#FF8200' }, lineStyle: { width: 3 } },
        { name: '电信', type: 'line', data: [80.5, 81.2, 82.0, 82.5, 82.3, 83.0], smooth: true, itemStyle: { color: '#52C41A' }, lineStyle: { width: 3 } },
        { name: '经管', type: 'line', data: [77.0, 78.0, 78.5, 79.2, 79.8, 80.5], smooth: true, itemStyle: { color: '#722ED1' }, lineStyle: { width: 3 } },
      ],
    };
  }, []);

  // 5. 课程通过率玫瑰图
  const roseOption: EChartsOption = useMemo(() => {
    const data = [
      { name: '高等数学A', value: 96 },
      { name: '数据结构', value: 92 },
      { name: '操作系统', value: 88 },
      { name: '计算机网络', value: 85 },
      { name: '数据库原理', value: 90 },
      { name: '软件工程', value: 94 },
      { name: '大学英语', value: 98 },
      { name: '线性代数', value: 87 },
      { name: '大学物理', value: 82 },
      { name: '概率统计', value: 89 },
    ];
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
      series: [
        {
          type: 'pie',
          radius: ['20%', '70%'],
          center: ['50%', '50%'],
          roseType: 'area',
          itemStyle: { borderRadius: 4 },
          label: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
          data: data.map((d) => ({
            ...d,
            itemStyle: {
              color: d.value >= 95 ? '#52C41A' : d.value >= 85 ? '#FF8200' : '#E14123',
            },
          })),
        },
      ],
    };
  }, []);

  // 6. 各专业对比雷达
  const radarOption: EChartsOption = useMemo(() => {
    return {
      tooltip: {},
      legend: {
        data: ['计算机', '电信', '经管', '机械'],
        top: 0,
        textStyle: { color: '#fff' },
      },
      radar: {
        indicator: [
          { name: '平均分', max: 100 },
          { name: '及格率', max: 100 },
          { name: '优秀率', max: 100 },
          { name: '最高分', max: 100 },
          { name: '标准差', max: 50 },
          { name: '参考人数', max: 5000 },
        ],
        splitArea: { areaStyle: { color: ['rgba(0,229,255,0.02)', 'rgba(0,229,255,0.05)'] } },
        axisName: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(0,229,255,0.2)' } },
      },
      series: [
        {
          type: 'radar',
          data: [
            { name: '计算机', value: [84, 96, 38, 99, 12, 4200], areaStyle: { color: 'rgba(255,130,0,0.3)' }, lineStyle: { color: '#FF8200' }, itemStyle: { color: '#FF8200' } },
            { name: '电信', value: [82, 94, 35, 98, 13, 3600], areaStyle: { color: 'rgba(82,196,26,0.3)' }, lineStyle: { color: '#52C41A' }, itemStyle: { color: '#52C41A' } },
            { name: '经管', value: [79, 92, 28, 96, 14, 2900], areaStyle: { color: 'rgba(114,46,209,0.3)' }, lineStyle: { color: '#722ED1' }, itemStyle: { color: '#722ED1' } },
            { name: '机械', value: [78, 91, 25, 95, 15, 3200], areaStyle: { color: 'rgba(80,125,175,0.3)' }, lineStyle: { color: '#507DAF' }, itemStyle: { color: '#507DAF' } },
          ],
        },
      ],
    };
  }, []);

  // 7. 地图（用散点图模拟中国地图）
  const mapOption: EChartsOption = useMemo(() => {
    return {
      tooltip: { trigger: 'item' },
      geo: {
        map: 'china',
        roam: false,
        silent: true,
        show: false,
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
        show: false,
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        show: false,
      },
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      series: [
        {
          // 用柱状图模拟地图（简化处理）
          type: 'scatter',
          coordinateSystem: 'cartesian2d',
          symbolSize: 30,
          data: [
            { name: '北京', value: [70, 35], itemStyle: { color: '#FF8200' } },
            { name: '上海', value: [82, 60], itemStyle: { color: '#FF8200' } },
            { name: '广东', value: [70, 80], itemStyle: { color: '#FF8200' } },
            { name: '江苏', value: [78, 55], itemStyle: { color: '#FFB800' } },
            { name: '浙江', value: [80, 60], itemStyle: { color: '#FFB800' } },
            { name: '山东', value: [75, 40], itemStyle: { color: '#FFB800' } },
            { name: '河南', value: [68, 50], itemStyle: { color: '#FFB800' } },
            { name: '四川', value: [55, 65], itemStyle: { color: '#52C41A' } },
            { name: '湖北', value: [65, 60], itemStyle: { color: '#FFB800' } },
            { name: '陕西', value: [55, 45], itemStyle: { color: '#FFB800' } },
            { name: '辽宁', value: [80, 25], itemStyle: { color: '#FFB800' } },
            { name: '福建', value: [78, 75], itemStyle: { color: '#FFB800' } },
            { name: '安徽', value: [72, 55], itemStyle: { color: '#FFB800' } },
            { name: '湖南', value: [65, 70], itemStyle: { color: '#FFB800' } },
            { name: '黑龙江', value: [85, 15], itemStyle: { color: '#00E5FF' } },
            { name: '吉林', value: [82, 20], itemStyle: { color: '#00E5FF' } },
          ],
          label: { show: true, position: 'top', color: '#fff', fontSize: 10, formatter: '{b}' },
        },
      ],
    };
  }, []);

  return (
    <div
      style={{
        margin: -20,
        padding: 16,
        minHeight: 'calc(100vh - 60px)',
        background: 'linear-gradient(180deg, #0B1B36 0%, #1E3A6F 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 装饰背景 */}
      <div
        style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -200,
          left: -200,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,130,0,0.08) 0%, transparent 70%)',
        }}
      />

      {/* 顶部标题栏 */}
      <div
        className="flex-between"
        style={{
          position: 'relative',
          padding: '12px 24px',
          marginBottom: 16,
          background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.1), transparent)',
          borderTop: '1px solid rgba(0,229,255,0.3)',
          borderBottom: '1px solid rgba(0,229,255,0.3)',
        }}
      >
        <div className="flex-align-center" style={{ gap: 12 }}>
          <Monitor size={22} color="#00E5FF" />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>
              学籍成绩管理系统 · 数据大屏
            </div>
            <div style={{ fontSize: 12, color: 'rgba(0,229,255,0.7)', marginTop: 2 }}>
              Student Achievement Management Dashboard
            </div>
          </div>
        </div>
        <div className="flex-align-center" style={{ gap: 24 }}>
          <div className="flex-align-center" style={{ gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#52C41A',
                boxShadow: '0 0 8px #52C41A',
              }}
            />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              系统运行正常
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#00E5FF', fontFamily: 'monospace' }}>
              {timeStr}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{dateStr}</div>
          </div>
        </div>
      </div>

      {/* KPI 卡片组 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <KpiCard
          variant="dark"
          label="在校学生总数"
          value="28,560"
          unit="人"
          trend={{ value: 3.2, label: '同比' }}
          icon={<GraduationCap size={20} />}
        />
        <KpiCard
          variant="dark"
          label="本学期开课数"
          value="1,236"
          unit="门"
          trend={{ value: 5.1, label: '同比' }}
          icon={<BookOpen size={20} />}
        />
        <KpiCard
          variant="dark"
          label="考试场次"
          value="486"
          unit="场"
          trend={{ value: 8.0, label: '同比' }}
          icon={<Activity size={20} />}
        />
        <KpiCard
          variant="dark"
          label="全校平均分"
          value="78.5"
          unit="分"
          trend={{ value: -1.2, label: '同比' }}
          icon={<Award size={20} />}
        />
      </div>

      {/* 第一行：分布图 + 柱状图 + 排行榜 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <ChartCard title="全校成绩等级分布" variant="dark" height={300}>
          <Chart option={distOption} height={300} />
        </ChartCard>
        <ChartCard title="分数段人数分布" variant="dark" height={300}>
          <Chart option={bucketOption} height={300} />
        </ChartCard>
        <ChartCard title="院系平均分 TOP10" variant="dark" height={300}>
          <Chart option={rankOption} height={300} />
        </ChartCard>
      </div>

      {/* 第二行：地图 + 趋势 + 玫瑰图 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <ChartCard
          title="全国生源分布（按高考平均分）"
          variant="dark"
          height={320}
          extra={
            <div className="flex-align-center" style={{ gap: 12, fontSize: 11 }}>
              <span className="flex-align-center" style={{ gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF8200' }} />
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>高分</span>
              </span>
              <span className="flex-align-center" style={{ gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFB800' }} />
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>中分</span>
              </span>
              <span className="flex-align-center" style={{ gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E5FF' }} />
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>低分</span>
              </span>
            </div>
          }
        >
          <Chart option={mapOption} height={320} />
        </ChartCard>
        <ChartCard title="课程通过率" variant="dark" height={320} extra="TOP 10 课程">
          <Chart option={roseOption} height={320} />
        </ChartCard>
        <ChartCard title="专业综合对比" variant="dark" height={320}>
          <Chart option={radarOption} height={320} />
        </ChartCard>
      </div>

      {/* 第三行：趋势 */}
      <div style={{ marginBottom: 16 }}>
        <ChartCard title="历届成绩趋势" variant="dark" extra="近 6 年" height={280}>
          <Chart option={trendOption} height={280} />
        </ChartCard>
      </div>

      {/* 底部预警信息滚动条 */}
      <div
        style={{
          background: 'rgba(225, 65, 35, 0.1)',
          border: '1px solid rgba(225, 65, 35, 0.4)',
          borderRadius: 6,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          className="flex-align-center"
          style={{
            gap: 6,
            padding: '4px 10px',
            background: 'rgba(225, 65, 35, 0.3)',
            borderRadius: 4,
            color: '#FF7875',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <AlertCircle size={14} />
          预警信息
        </div>
        <div
          style={{
            flex: 1,
            color: '#fff',
            fontSize: 13,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              animation: 'marquee 30s linear infinite',
            }}
          >
            {[
              '【预警】《高等数学A》不及格率达 18%，超出阈值 15%',
              '【预警】机械学院 2023-2 班平均分低于全校 12 分',
              '【预警】教师张**教授《操作系统》课程标准差达 18.5，方差过大',
              '【提示】本学期新开设 12 门课程，请关注教学评估',
              '【通知】下周一开始进行期中考试集中录入',
              '【预警】化学专业《有机化学》优秀率低于 5%',
            ].map((msg, i) => (
              <span key={i} style={{ marginRight: 60 }}>
                {msg}
              </span>
            ))}
          </div>
          <style>{`
            @keyframes marquee {
              from { transform: translateX(0%); }
              to { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
