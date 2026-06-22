import ReactECharts from 'echarts-for-react';
import { useEffect, useRef } from 'react';
import type { EChartsOption } from 'echarts';

interface ChartProps {
  option: EChartsOption;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
  loading?: boolean;
  onEvents?: Record<string, (params: unknown) => void>;
}

/**
 * 通用 ECharts 包装组件
 * - 解决 resize
 * - 避免内存泄漏（dispose）
 */
export default function Chart({
  option,
  height = 320,
  style,
  className,
  loading,
  onEvents,
}: ChartProps) {
  const ref = useRef<ReactECharts>(null);

  useEffect(() => {
    const handler = () => {
      const echarts = ref.current?.getEchartsInstance();
      echarts?.resize();
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
      const echarts = ref.current?.getEchartsInstance();
      echarts?.dispose();
    };
  }, []);

  return (
    <ReactECharts
      ref={ref}
      option={option}
      style={{ height, width: '100%', ...style }}
      className={className}
      showLoading={loading}
      onEvents={onEvents}
      opts={{ renderer: 'canvas' }}
    />
  );
}
