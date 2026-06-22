import { useMemo, useState } from 'react';
import {
  Plus,
  Upload,
  Download,
  Edit3,
  Trash2,
  KeyRound,
  Power,
  Search,
  Users as UsersIcon,
  GraduationCap,
} from 'lucide-react';
import {
  students,
  teachers,
  studentById,
  teacherById,
} from '../../mock/data';
import { ContentBox, StatusTag } from '../../components/UI';
import { message } from '../../components/MessageHost';
import { confirm } from '../../components/ModalHost';

type Tab = 'student' | 'teacher';

export default function AdminUsers() {
  const [tab, setTab] = useState<Tab>('student');
  const [keyword, setKeyword] = useState('');
  const [filterMajor, setFilterMajor] = useState('全部');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const studentList = useMemo(() => {
    return students.filter((s) => {
      if (keyword && !s.name.includes(keyword) && !s.studentNo.includes(keyword)) return false;
      if (filterMajor !== '全部' && s.major !== filterMajor) return false;
      if (filterStatus !== '全部' && s.status !== filterStatus) return false;
      return true;
    });
  }, [keyword, filterMajor, filterStatus]);

  const teacherList = useMemo(() => {
    return teachers.filter((t) => {
      if (keyword && !t.name.includes(keyword) && !t.teacherNo.includes(keyword)) return false;
      if (filterStatus !== '全部' && t.status !== filterStatus) return false;
      return true;
    });
  }, [keyword, filterStatus]);

  const majors = Array.from(new Set(students.map((s) => s.major)));

  const handleResetPassword = (id: string, role: 'student' | 'teacher') => {
    confirm({
      title: '重置密码',
      content: <div>确认将密码重置为 <b>123456</b>？</div>,
      onOk: () => message('密码已重置', 'success'),
    });
  };

  const handleToggleStatus = (id: string, role: 'student' | 'teacher') => {
    const u = role === 'student' ? studentById(id) : teacherById(id);
    if (!u) return;
    const next = u.status === '正常' ? '停用' : '正常';
    confirm({
      title: `${next === '停用' ? '停用' : '启用'}账号`,
      content: <div>确认{next === '停用' ? '停用' : '启用'}账号 <b>{u.name}</b>？</div>,
      onOk: () => {
        u.status = next as typeof u.status;
        message(`账号已${next === '停用' ? '停用' : '启用'}`, 'success');
      },
    });
  };

  const handleDelete = (id: string, role: 'student' | 'teacher') => {
    const u = role === 'student' ? studentById(id) : teacherById(id);
    if (!u) return;
    confirm({
      title: '删除用户',
      content: (
        <div>
          <p>确认删除账号 <b>{u.name}</b>？</p>
          <p style={{ marginTop: 8, color: 'var(--w-special)', fontSize: 13 }}>
            将进行软删除，30 天后物理删除。
          </p>
        </div>
      ),
      danger: true,
      okText: '确认删除',
      onOk: () => message('用户已删除（软删除）', 'success'),
    });
  };

  return (
    <div>
      <ContentBox>
        {/* 标签切换 */}
        <div
          className="flex-align-center"
          style={{
            borderBottom: '1px solid var(--w-divider)',
            marginBottom: 16,
            gap: 24,
          }}
        >
          {[
            { key: 'student' as const, label: `学生列表 (${students.length})` },
            { key: 'teacher' as const, label: `教师列表 (${teachers.length})` },
          ].map((t) => (
            <div
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setKeyword('');
                setFilterMajor('全部');
              }}
              style={{
                padding: '10px 4px',
                fontSize: 14,
                fontWeight: tab === t.key ? 600 : 400,
                color: tab === t.key ? 'var(--w-brand)' : 'var(--w-main)',
                borderBottom: tab === t.key ? '2px solid var(--w-brand)' : '2px solid transparent',
                marginBottom: -1,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </div>
          ))}
        </div>

        {/* 筛选 + 操作 */}
        <div
          className="flex-align-center"
          style={{
            gap: 12,
            padding: 12,
            background: 'var(--w-page-bg)',
            borderRadius: 8,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div className="flex-align-center" style={{ gap: 6 }}>
            <Search size={14} color="var(--w-sub)" />
            <div className="woo-input-wrap" style={{ width: 200 }}>
              <input
                placeholder={tab === 'student' ? '搜索学号/姓名' : '搜索工号/姓名'}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
          {tab === 'student' && (
            <select
              className="woo-select"
              style={{ width: 180, height: 32 }}
              value={filterMajor}
              onChange={(e) => setFilterMajor(e.target.value)}
            >
              <option>全部</option>
              {majors.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          )}
          <select
            className="woo-select"
            style={{ width: 120, height: 32 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>全部</option>
            <option>正常</option>
            <option>停用</option>
            <option>注销</option>
            <option>待审核</option>
          </select>
          <div className="flex-1" />
          <button
            className="woo-button woo-button-s woo-button-line woo-button-default"
            onClick={() => message('已导出当前筛选结果', 'success')}
          >
            <Download size={14} />
            导出
          </button>
          <button
            className="woo-button woo-button-s woo-button-line woo-button-primary"
            onClick={() => message('模板已下载', 'success')}
          >
            <Upload size={14} />
            批量导入
          </button>
          <button
            className="woo-button woo-button-s woo-button-flat woo-button-primary"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={14} />
            新增{tab === 'student' ? '学生' : '教师'}
          </button>
        </div>

        {/* 表格 */}
        {tab === 'student' ? (
          <table className="woo-table">
            <thead>
              <tr>
                <th>学号</th>
                <th>姓名</th>
                <th>性别</th>
                <th>专业</th>
                <th>班级</th>
                <th>入学年份</th>
                <th>联系方式</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {studentList.slice(0, 30).map((s) => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--w-sub)', fontSize: 12 }}>{s.studentNo}</td>
                  <td style={{ fontWeight: 500 }}>
                    <div className="flex-align-center" style={{ gap: 8 }}>
                      <div className="woo-avatar-main" style={{ width: 24, height: 24, fontSize: 12 }}>
                        {s.name.charAt(0)}
                      </div>
                      {s.name}
                    </div>
                  </td>
                  <td>{s.gender}</td>
                  <td>{s.major}</td>
                  <td>{s.className}</td>
                  <td>{s.enrollmentYear}</td>
                  <td style={{ fontSize: 12, color: 'var(--w-sub)' }}>{s.phone}</td>
                  <td><StatusTag status={s.status} /></td>
                  <td>
                    <div className="flex-align-center" style={{ gap: 4 }}>
                      <button
                        className="woo-button woo-button-s woo-button-line woo-button-default"
                        style={{ padding: '2px 8px' }}
                        onClick={() => setEditingId(s.id)}
                        title="编辑"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        className="woo-button woo-button-s woo-button-line woo-button-default"
                        style={{ padding: '2px 8px' }}
                        onClick={() => handleResetPassword(s.id, 'student')}
                        title="重置密码"
                      >
                        <KeyRound size={12} />
                      </button>
                      <button
                        className="woo-button woo-button-s woo-button-line woo-button-default"
                        style={{ padding: '2px 8px' }}
                        onClick={() => handleToggleStatus(s.id, 'student')}
                        title="启停"
                      >
                        <Power size={12} />
                      </button>
                      <button
                        className="woo-button woo-button-s woo-button-line woo-button-default"
                        style={{ padding: '2px 8px', color: 'var(--w-special)' }}
                        onClick={() => handleDelete(s.id, 'student')}
                        title="删除"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="woo-table">
            <thead>
              <tr>
                <th>工号</th>
                <th>姓名</th>
                <th>性别</th>
                <th>职称</th>
                <th>院系</th>
                <th>联系方式</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {teacherList.slice(0, 30).map((t) => (
                <tr key={t.id}>
                  <td style={{ color: 'var(--w-sub)', fontSize: 12 }}>{t.teacherNo}</td>
                  <td style={{ fontWeight: 500 }}>
                    <div className="flex-align-center" style={{ gap: 8 }}>
                      <div className="woo-avatar-main" style={{ width: 24, height: 24, fontSize: 12 }}>
                        {t.name.charAt(0)}
                      </div>
                      {t.name}
                    </div>
                  </td>
                  <td>{t.gender}</td>
                  <td>{t.title}</td>
                  <td>{t.department}</td>
                  <td style={{ fontSize: 12, color: 'var(--w-sub)' }}>{t.phone}</td>
                  <td><StatusTag status={t.status} /></td>
                  <td>
                    <div className="flex-align-center" style={{ gap: 4 }}>
                      <button
                        className="woo-button woo-button-s woo-button-line woo-button-default"
                        style={{ padding: '2px 8px' }}
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        className="woo-button woo-button-s woo-button-line woo-button-default"
                        style={{ padding: '2px 8px' }}
                        onClick={() => handleResetPassword(t.id, 'teacher')}
                      >
                        <KeyRound size={12} />
                      </button>
                      <button
                        className="woo-button woo-button-s woo-button-line woo-button-default"
                        style={{ padding: '2px 8px' }}
                        onClick={() => handleToggleStatus(t.id, 'teacher')}
                      >
                        <Power size={12} />
                      </button>
                      <button
                        className="woo-button woo-button-s woo-button-line woo-button-default"
                        style={{ padding: '2px 8px', color: 'var(--w-special)' }}
                        onClick={() => handleDelete(t.id, 'teacher')}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div
          className="flex-between"
          style={{ marginTop: 16, color: 'var(--w-sub)', fontSize: 13 }}
        >
          <span>
            共 {(tab === 'student' ? studentList : teacherList).length} 条记录
          </span>
          <div className="flex-align-center" style={{ gap: 6 }}>
            <button className="woo-button woo-button-s woo-button-line woo-button-default">上一页</button>
            <span>1 / 4</span>
            <button className="woo-button woo-button-s woo-button-line woo-button-default">下一页</button>
          </div>
        </div>
      </ContentBox>

      {/* 新增弹窗 */}
      {showCreate && (
        <div
          className="woo-modal-mask"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="woo-modal-wrap"
            onClick={() => setShowCreate(false)}
          >
            <div
              className="woo-modal-main"
              style={{ width: 520 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="woo-modal-header">
                新增{tab === 'student' ? '学生' : '教师'}
              </div>
              <div className="woo-modal-body">
                <div className="form-item">
                  <label className="form-label">
                    <span className="required">*</span>{tab === 'student' ? '学号' : '工号'}
                  </label>
                  <input className="woo-input" placeholder="请输入" />
                </div>
                <div className="form-item">
                  <label className="form-label">
                    <span className="required">*</span>姓名
                  </label>
                  <input className="woo-input" placeholder="请输入姓名" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-item">
                    <label className="form-label">性别</label>
                    <select className="woo-select">
                      <option>男</option>
                      <option>女</option>
                    </select>
                  </div>
                  {tab === 'student' ? (
                    <div className="form-item">
                      <label className="form-label">专业</label>
                      <select className="woo-select">
                        {majors.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-item">
                      <label className="form-label">院系</label>
                      <select className="woo-select">
                        <option>计算机学院</option>
                        <option>电信学院</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="form-item">
                  <label className="form-label">手机号</label>
                  <input className="woo-input" placeholder="11 位手机号" />
                </div>
                <div className="form-item">
                  <label className="form-label">邮箱</label>
                  <input className="woo-input" placeholder="邮箱地址" />
                </div>
              </div>
              <div className="woo-modal-footer">
                <button
                  className="woo-button woo-button-m woo-button-line woo-button-default"
                  onClick={() => setShowCreate(false)}
                >
                  取消
                </button>
                <button
                  className="woo-button woo-button-m woo-button-flat woo-button-primary"
                  onClick={() => {
                    setShowCreate(false);
                    message(`${tab === 'student' ? '学生' : '教师'}账号创建成功，初始密码 123456`, 'success');
                  }}
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
