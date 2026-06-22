import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Settings,
  User as UserIcon,
  Lock,
  Sparkles,
  Shield,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { message } from '../components/MessageHost';

const roleCards = [
  {
    key: 'student' as const,
    title: '学生入口',
    desc: '查询成绩、查看个人图谱、管理学籍信息',
    icon: <GraduationCap size={36} />,
    bg: 'linear-gradient(135deg, #FF8200 0%, #FF5900 100%)',
    defaultUser: '202400001',
    tips: ['账号格式：2024xxxxx', '初始密码：123456'],
  },
  {
    key: 'teacher' as const,
    title: '教师入口',
    desc: '管理所授课程成绩、维护课程信息、查看教学分析',
    icon: <BookOpen size={36} />,
    bg: 'linear-gradient(135deg, #507DAF 0%, #2B5C95 100%)',
    defaultUser: 'T20240001',
    tips: ['账号格式：T20240xxx', '初始密码：123456'],
  },
  {
    key: 'admin' as const,
    title: '管理员入口',
    desc: '用户管理、课程管理、成绩管理、数据大屏',
    icon: <Settings size={36} />,
    bg: 'linear-gradient(135deg, #52C41A 0%, #389E0D 100%)',
    defaultUser: 'admin',
    tips: ['账号：admin', '密码：admin123'],
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [activeRole, setActiveRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [username, setUsername] = useState('202400001');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  if (user) {
    if (user.role === 'student') return <Navigate to="/student" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
    return <Navigate to="/admin" replace />;
  }

  const handleRoleChange = (role: 'student' | 'teacher' | 'admin') => {
    setActiveRole(role);
    const card = roleCards.find((c) => c.key === role)!;
    setUsername(card.defaultUser);
    setPassword(role === 'admin' ? 'admin123' : '123456');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const result = login(username, password);
      setLoading(false);
      if (result) {
        message(`欢迎回来，${result.name}`, 'success');
        if (result.role === 'student') navigate('/student');
        else if (result.role === 'teacher') navigate('/teacher');
        else navigate('/admin');
      } else {
        message('账号或密码错误', 'error');
      }
    }, 400);
  };

  const active = roleCards.find((c) => c.key === activeRole)!;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background:
          'linear-gradient(135deg, #FFF7E6 0%, #FFE7C2 50%, #FFD9A3 100%)',
      }}
    >
      {/* 左侧品牌区 */}
      <div
        style={{
          flex: 1,
          padding: '60px 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#fff',
          background:
            'linear-gradient(135deg, #FF8200 0%, #FF5900 60%, #C93518 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            left: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }}
        />

        <div style={{ position: 'relative' }}>
          <div
            className="flex-align-center"
            style={{ gap: 14, fontSize: 26, fontWeight: 700, marginBottom: 16 }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={28} />
            </div>
            <span>学籍成绩管理系统</span>
          </div>
          <div style={{ fontSize: 14, opacity: 0.85, maxWidth: 460 }}>
            统一管理学生学籍与课程成绩，提供高效的数据查询、统计分析与可视化能力。
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.3, marginBottom: 20 }}>
            数字化教学管理
            <br />
            智能化决策支持
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              maxWidth: 540,
            }}
          >
            {[
              { icon: <UserIcon size={18} />, label: '三角色权限' },
              { icon: <BarChart3 size={18} />, label: '数据大屏' },
              { icon: <Shield size={18} />, label: '安全可靠' },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  padding: 14,
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div style={{ marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', fontSize: 12, opacity: 0.7 }}>
          © 2025 Student Achievement Management System · v1.0
        </div>
      </div>

      {/* 右侧登录区 */}
      <div
        style={{
          width: 520,
          padding: 60,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, marginBottom: 8 }}>欢迎登录</h2>
          <p style={{ color: 'var(--w-sub)', fontSize: 14 }}>
            请选择您的身份并输入账号信息
          </p>
        </div>

        {/* 角色选择卡 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 28,
          }}
        >
          {roleCards.map((card) => {
            const active = activeRole === card.key;
            return (
              <div
                key={card.key}
                onClick={() => handleRoleChange(card.key)}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: active
                    ? '2px solid var(--w-brand)'
                    : '1px solid var(--w-border)',
                  background: active ? 'var(--w-hover)' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    margin: '0 auto 8px',
                    borderRadius: 10,
                    background: card.bg,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{card.title}</div>
              </div>
            );
          })}
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit}>
          <div className="form-item">
            <label className="form-label">账号</label>
            <div className="woo-input-wrap">
              <UserIcon size={16} color="var(--w-sub)" style={{ marginRight: 8 }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入账号"
                required
              />
            </div>
          </div>

          <div className="form-item">
            <label className="form-label">密码</label>
            <div className="woo-input-wrap">
              <Lock size={16} color="var(--w-sub)" style={{ marginRight: 8 }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
              />
            </div>
          </div>

          <div
            style={{
              background: '#FFF7E6',
              border: '1px solid #FFD591',
              borderRadius: 6,
              padding: 12,
              marginBottom: 20,
              fontSize: 12,
              color: '#874D00',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>演示账号</div>
            {active.tips.map((t, i) => (
              <div key={i}>· {t}</div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="woo-button woo-button-l woo-button-flat woo-button-primary"
            style={{ width: '100%' }}
          >
            {loading ? '登录中...' : '登 录'}
          </button>

          <div
            style={{
              marginTop: 16,
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--w-sub)',
            }}
          >
            登录即代表您同意《用户协议》和《隐私政策》
          </div>
        </form>
      </div>
    </div>
  );
}
