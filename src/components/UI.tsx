import { ReactNode } from 'react';

/**
 * 内容卡片容器
 */
export function ContentBox({
  title,
  extra,
  children,
  style,
}: {
  title?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="content-box" style={style}>
      {title && <div className="content-box-title">{title}<div>{extra}</div></div>}
      {children}
    </div>
  );
}

/**
 * KPI 卡片 - 普通 / 大屏两种风格
 */
export function KpiCard({
  label,
  value,
  trend,
  unit,
  variant = 'light',
  icon,
}: {
  label: string;
  value: string | number;
  trend?: { value: number; label: string };
  unit?: string;
  variant?: 'light' | 'dark';
  icon?: ReactNode;
}) {
  const isDark = variant === 'dark';
  return (
    <div
      style={{
        padding: isDark ? '20px 24px' : 18,
        background: isDark
          ? 'linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(0,229,255,0.02) 100%)'
          : '#fff',
        border: isDark ? '1px solid rgba(0,229,255,0.3)' : '1px solid var(--w-divider)',
        borderRadius: isDark ? 8 : 10,
        boxShadow: isDark ? 'none' : 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden',
        color: isDark ? '#fff' : 'inherit',
      }}
    >
      {isDark && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #00E5FF, transparent)',
          }}
        />
      )}
      <div
        className="flex-between"
        style={{ marginBottom: 8 }}
      >
        <span
          style={{
            fontSize: 13,
            color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--w-sub)',
          }}
        >
          {label}
        </span>
        {icon && (
          <span style={{ color: isDark ? '#00E5FF' : 'var(--w-brand)' }}>{icon}</span>
        )}
      </div>
      <div
        className="flex-align-center"
        style={{ gap: 6, marginBottom: 6 }}
      >
        <span
          style={{
            fontSize: isDark ? 32 : 26,
            fontWeight: 700,
            color: isDark ? '#00E5FF' : 'var(--w-main)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontSize: 14,
              color: isDark ? 'rgba(255,255,255,0.6)' : 'var(--w-sub)',
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {trend && (
        <div
          style={{
            fontSize: 12,
            color: trend.value > 0 ? '#52C41A' : '#E14123',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>
            {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'var(--w-sub)' }}>
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * 图表卡片 - 包裹 ECharts 使用
 */
export function ChartCard({
  title,
  extra,
  children,
  height = 320,
  variant = 'light',
}: {
  title?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  height?: number;
  variant?: 'light' | 'dark';
}) {
  const isDark = variant === 'dark';
  return (
    <div
      style={{
        background: isDark
          ? 'rgba(16, 35, 75, 0.6)'
          : '#fff',
        border: isDark
          ? '1px solid rgba(0,229,255,0.2)'
          : '1px solid var(--w-divider)',
        borderRadius: isDark ? 8 : 10,
        padding: isDark ? '16px 20px' : 20,
        boxShadow: isDark ? 'none' : 'var(--shadow-card)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: isDark ? 'blur(4px)' : 'none',
      }}
    >
      {title && (
        <div
          className="flex-between"
          style={{
            marginBottom: 12,
            paddingBottom: isDark ? 10 : 0,
            borderBottom: isDark ? '1px solid rgba(0,229,255,0.2)' : 'none',
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: isDark ? '#fff' : 'var(--w-main)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {isDark && (
              <span
                style={{
                  width: 3,
                  height: 14,
                  background: '#00E5FF',
                  display: 'inline-block',
                }}
              />
            )}
            {title}
          </span>
          {extra && (
            <span
              style={{
                fontSize: 12,
                color: isDark ? 'rgba(255,255,255,0.5)' : 'var(--w-sub)',
              }}
            >
              {extra}
            </span>
          )}
        </div>
      )}
      <div style={{ flex: 1, minHeight: height }}>{children}</div>
    </div>
  );
}

/**
 * 标签 - 等级颜色
 */
export function LevelTag({ level }: { level: string }) {
  const map: Record<string, string> = {
    优秀: 'woo-tag-success',
    良好: 'woo-tag-warning',
    中等: 'woo-tag-primary',
    及格: 'woo-tag-info',
    不及格: 'woo-tag-danger',
  };
  return <span className={`woo-tag ${map[level] ?? ''}`}>{level}</span>;
}

/**
 * 状态标签
 */
export function StatusTag({ status }: { status: string }) {
  const map: Record<string, { className: string; color: string }> = {
    正常: { className: '', color: 'var(--w-success)' },
    停用: { className: '', color: 'var(--w-disabled)' },
    注销: { className: '', color: 'var(--w-special)' },
    待审核: { className: '', color: 'var(--w-warning)' },
  };
  const cfg = map[status] ?? { className: '', color: 'var(--w-sub)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', color: cfg.color, fontSize: 13 }}>
      <span
        className="status-dot"
        style={{ background: cfg.color }}
      />
      {status}
    </span>
  );
}
