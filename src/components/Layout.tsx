import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Users,
  BarChart3,
  User,
  LogOut,
  Bell,
  Search,
  Settings,
  Home,
  Award,
  UserMinus,
  FileText,
  PieChart,
  TrendingUp,
  Monitor,
  ChevronDown,
  Menu as MenuIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Role, notifications } from '../mock/data';
import { message } from './MessageHost';

interface MenuItem {
  key: string;
  label: string;
  icon: JSX.Element;
  path: string;
}

const menuByRole: Record<Role, MenuItem[]> = {
  student: [
    { key: 'home', label: '首页', icon: <Home size={18} />, path: '/student' },
    { key: 'score', label: '成绩查询', icon: <Award size={18} />, path: '/student/score' },
    { key: 'visual', label: '个人图谱', icon: <BarChart3 size={18} />, path: '/student/visual' },
    { key: 'profile', label: '个人中心', icon: <User size={18} />, path: '/student/profile' },
    { key: 'deregister', label: '账号注销', icon: <UserMinus size={18} />, path: '/student/deregister' },
  ],
  teacher: [
    { key: 'home', label: '首页', icon: <Home size={18} />, path: '/teacher' },
    { key: 'score', label: '成绩管理', icon: <Award size={18} />, path: '/teacher/score' },
    { key: 'course', label: '课程管理', icon: <BookOpen size={18} />, path: '/teacher/course' },
    { key: 'analytics', label: '统计分析', icon: <BarChart3 size={18} />, path: '/teacher/analytics' },
    { key: 'profile', label: '个人中心', icon: <User size={18} />, path: '/teacher/profile' },
  ],
  admin: [
    { key: 'home', label: '首页', icon: <Home size={18} />, path: '/admin' },
    { key: 'users', label: '用户管理', icon: <Users size={18} />, path: '/admin/users' },
    { key: 'courses', label: '课程管理', icon: <BookOpen size={18} />, path: '/admin/courses' },
    { key: 'scores', label: '成绩管理', icon: <Award size={18} />, path: '/admin/scores' },
    { key: 'dashboard', label: '数据大屏', icon: <Monitor size={18} />, path: '/admin/dashboard' },
    { key: 'stats', label: '统计分析', icon: <PieChart size={18} />, path: '/admin/stats' },
  ],
};

const roleLabel = {
  student: '学生端',
  teacher: '教师端',
  admin: '管理员端',
};

const roleLogo = {
  student: <GraduationCap size={22} />,
  teacher: <BookOpen size={22} />,
  admin: <Settings size={22} />,
};

export default function Layout({ role }: { role: Role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideCollapsed, setSideCollapsed] = useState(false);

  const menu = menuByRole[role];
  const myNotifs = notifications.filter((n) => n.userId === user?.id || (role === 'admin' && n.userId === 'A001'));
  const unreadCount = myNotifs.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    message('已退出登录', 'success');
    navigate('/login');
  };

  const activeKey =
    menu.find((m) => m.path === location.pathname)?.key ??
    (location.pathname === menu[0].path ? menu[0].key : '');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--w-page-bg)' }}>
      {/* Header */}
      <header
        className="flex-align-center"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          padding: '0 20px',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          zIndex: 100,
          justifyContent: 'space-between',
        }}
      >
        <div className="flex-align-center" style={{ gap: 16 }}>
          <button
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              padding: 4,
            }}
            onClick={() => setSideCollapsed(!sideCollapsed)}
          >
            <MenuIcon size={22} />
          </button>
          <div
            className="flex-align-center"
            style={{ gap: 10, color: 'var(--w-brand)', fontWeight: 700, fontSize: 18 }}
          >
            {roleLogo[role]}
            <span>学籍成绩管理系统 · {roleLabel[role]}</span>
          </div>
        </div>

        <div className="flex-align-center" style={{ gap: 16 }}>
          {/* 搜索 */}
          <div
            className="flex-align-center"
            style={{
              background: 'var(--w-input-bg)',
              borderRadius: 18,
              padding: '0 14px',
              height: 36,
              width: 220,
              gap: 6,
            }}
          >
            <Search size={16} color="var(--w-sub)" />
            <input
              placeholder="搜索课程/学生/教师"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 13,
                flex: 1,
              }}
            />
          </div>

          {/* 通知 */}
          <div style={{ position: 'relative' }}>
            <button
              className="flex-align-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--w-input-bg)',
                position: 'relative',
              }}
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell size={18} color="var(--w-main)" />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    background: 'var(--w-special)',
                    color: '#fff',
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div
                className="woo-pop-main"
                style={{
                  position: 'absolute',
                  top: 44,
                  right: 0,
                  width: 320,
                  maxHeight: 400,
                  overflow: 'auto',
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--w-divider)',
                    fontWeight: 600,
                  }}
                >
                  消息通知
                </div>
                {myNotifs.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--w-sub)' }}>
                    暂无消息
                  </div>
                ) : (
                  myNotifs.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: 12,
                        borderBottom: '1px solid var(--w-divider)',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setNotifOpen(false);
                        navigate(menu.find((m) => m.key === 'profile')?.path ?? '/');
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: 4 }}>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{n.title}</span>
                        {!n.read && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: 'var(--w-special)',
                            }}
                          />
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--w-sub)' }}>
                        {n.content}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--w-sub)', marginTop: 4 }}>
                        {n.createdAt}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 用户 */}
          <div style={{ position: 'relative' }}>
            <button
              className="flex-align-center"
              style={{ gap: 8, padding: '4px 8px', borderRadius: 18 }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="woo-avatar-main" style={{ width: 32, height: 32, fontSize: 14 }}>
                {user?.name?.charAt(0) ?? 'U'}
              </div>
              <span style={{ fontSize: 14 }}>{user?.name}</span>
              <ChevronDown size={14} color="var(--w-sub)" />
            </button>
            {menuOpen && (
              <div
                className="woo-pop-main"
                style={{
                  position: 'absolute',
                  top: 44,
                  right: 0,
                  width: 160,
                  zIndex: 1000,
                }}
              >
                <Link
                  to={menu.find((m) => m.key === 'profile')?.path ?? '/'}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    color: 'var(--w-main)',
                    fontSize: 13,
                    borderBottom: '1px solid var(--w-divider)',
                  }}
                >
                  <User size={14} />
                  个人中心
                </Link>
                <div
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    color: 'var(--w-special)',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={14} />
                  退出登录
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 主体 */}
      <div style={{ display: 'flex', paddingTop: 60, minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside
          style={{
            position: 'fixed',
            top: 60,
            left: 0,
            bottom: 0,
            width: sideCollapsed ? 64 : 200,
            background: '#fff',
            borderRight: '1px solid var(--w-divider)',
            padding: '16px 0',
            overflowY: 'auto',
            transition: 'width 0.2s',
            zIndex: 90,
          }}
        >
          {menu.map((m) => {
            const active = m.key === activeKey;
            return (
              <div
                key={m.key}
                onClick={() => navigate(m.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  margin: '2px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: active ? 'var(--w-brand)' : 'var(--w-main)',
                  background: active ? 'var(--w-hover)' : 'transparent',
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  transition: 'all 0.2s',
                }}
              >
                {m.icon}
                {!sideCollapsed && <span>{m.label}</span>}
              </div>
            );
          })}
        </aside>

        {/* Main content */}
        <main
          style={{
            flex: 1,
            marginLeft: sideCollapsed ? 64 : 200,
            padding: 20,
            minWidth: 0,
          }}
        >
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
