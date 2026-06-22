import { useState } from 'react';
import { User, Lock, School, Briefcase, Mail, Phone, Camera, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { teacherById, courses, scores } from '../../mock/data';
import { ContentBox } from '../../components/UI';
import { message } from '../../components/MessageHost';

export default function TeacherProfile() {
  const { user, updateUser } = useAuth();
  if (!user) return null;
  const teacher = teacherById(user.id);
  if (!teacher) return null;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: teacher.name,
    phone: teacher.phone,
    email: teacher.email,
  });
  const [pwdForm, setPwdForm] = useState({ old: '', neu: '', confirm: '' });

  const myCourses = courses.filter((c) => c.teacherId === user.id);
  const myScores = scores.filter((s) => s.teacherId === user.id);

  const handleSave = () => {
    updateUser({ ...teacher, ...form });
    setEditing(false);
    message('资料已保存', 'success');
  };

  const handleChangePassword = () => {
    if (!pwdForm.old || !pwdForm.neu || !pwdForm.confirm) {
      message('请填写完整密码信息', 'warning');
      return;
    }
    if (pwdForm.old !== teacher.password) {
      message('原密码错误', 'error');
      return;
    }
    if (pwdForm.neu !== pwdForm.confirm) {
      message('两次新密码输入不一致', 'error');
      return;
    }
    updateUser({ ...teacher, password: pwdForm.neu });
    setPwdForm({ old: '', neu: '', confirm: '' });
    message('密码修改成功', 'success');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
      <div>
        <div className="content-box" style={{ textAlign: 'center' }}>
          <div
            style={{
              position: 'relative',
              width: 100,
              height: 100,
              margin: '0 auto 12px',
            }}
          >
            <div
              className="woo-avatar-main"
              style={{ width: 100, height: 100, fontSize: 36 }}
            >
              {teacher.name.charAt(0)}
            </div>
            <button
              className="flex-center"
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--w-brand)',
                color: '#fff',
                border: '2px solid #fff',
              }}
            >
              <Camera size={14} />
            </button>
          </div>
          <h3 style={{ fontSize: 18, marginBottom: 4 }}>{teacher.name}</h3>
          <div style={{ fontSize: 13, color: 'var(--w-sub)' }}>
            {teacher.title} · {teacher.department}
          </div>
          <div style={{ fontSize: 12, color: 'var(--w-sub)', marginTop: 8 }}>
            {teacher.teacherNo}
          </div>
        </div>

        <div className="content-box">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>教学统计</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="flex-between">
              <span style={{ fontSize: 13, color: 'var(--w-sub)' }}>累计授课</span>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{myCourses.length} 门</span>
            </div>
            <div className="flex-between">
              <span style={{ fontSize: 13, color: 'var(--w-sub)' }}>授课学生</span>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{new Set(myScores.map((s) => s.studentId)).size} 人</span>
            </div>
            <div className="flex-between">
              <span style={{ fontSize: 13, color: 'var(--w-sub)' }}>成绩记录</span>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{myScores.length} 条</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <ContentBox
          title={
            <div className="flex-align-center" style={{ gap: 8 }}>
              <User size={18} color="var(--w-brand)" />
              <span>基本资料</span>
            </div>
          }
          extra={
            editing ? (
              <div className="flex-align-center" style={{ gap: 8 }}>
                <button
                  className="woo-button woo-button-s woo-button-line woo-button-default"
                  onClick={() => {
                    setForm({ name: teacher.name, phone: teacher.phone, email: teacher.email });
                    setEditing(false);
                  }}
                >
                  取消
                </button>
                <button
                  className="woo-button woo-button-s woo-button-flat woo-button-primary"
                  onClick={handleSave}
                >
                  保存
                </button>
              </div>
            ) : (
              <button
                className="woo-button woo-button-s woo-button-line woo-button-primary"
                onClick={() => setEditing(true)}
              >
                编辑
              </button>
            )
          }
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
          >
            <div className="form-item">
              <label className="form-label">姓名</label>
              <input
                className="woo-input"
                disabled={!editing}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-item">
              <label className="form-label">工号（只读）</label>
              <input className="woo-input" disabled value={teacher.teacherNo} />
            </div>
            <div className="form-item">
              <label className="form-label">性别（只读）</label>
              <input className="woo-input" disabled value={teacher.gender} />
            </div>
            <div className="form-item">
              <label className="form-label">职称（只读）</label>
              <input className="woo-input" disabled value={teacher.title} />
            </div>
            <div className="form-item">
              <label className="form-label">院系（只读）</label>
              <input className="woo-input" disabled value={teacher.department} />
            </div>
            <div className="form-item">
              <label className="form-label">手机号</label>
              <input
                className="woo-input"
                disabled={!editing}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-item">
              <label className="form-label">邮箱</label>
              <input
                className="woo-input"
                disabled={!editing}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
        </ContentBox>

        <ContentBox
          title={
            <div className="flex-align-center" style={{ gap: 8 }}>
              <BookOpen size={18} color="var(--w-brand)" />
              <span>授课记录</span>
            </div>
          }
        >
          <table className="woo-table">
            <thead>
              <tr>
                <th>学期</th>
                <th>课程</th>
                <th>学分</th>
                <th>学生数</th>
              </tr>
            </thead>
            <tbody>
              {myCourses.slice(0, 10).map((c) => {
                const count = scores.filter((s) => s.courseId === c.id).length;
                return (
                  <tr key={c.id}>
                    <td>{c.year} {c.semester}</td>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.credits}</td>
                    <td>{count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ContentBox>

        <ContentBox
          title={
            <div className="flex-align-center" style={{ gap: 8 }}>
              <Lock size={18} color="var(--w-brand)" />
              <span>修改密码</span>
            </div>
          }
        >
          <div style={{ maxWidth: 480 }}>
            <div className="form-item">
              <label className="form-label">原密码</label>
              <input
                type="password"
                className="woo-input"
                value={pwdForm.old}
                onChange={(e) => setPwdForm({ ...pwdForm, old: e.target.value })}
                placeholder="请输入原密码"
              />
            </div>
            <div className="form-item">
              <label className="form-label">新密码</label>
              <input
                type="password"
                className="woo-input"
                value={pwdForm.neu}
                onChange={(e) => setPwdForm({ ...pwdForm, neu: e.target.value })}
                placeholder="8-20 位，含大小写字母与数字"
              />
            </div>
            <div className="form-item">
              <label className="form-label">确认新密码</label>
              <input
                type="password"
                className="woo-input"
                value={pwdForm.confirm}
                onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                placeholder="再次输入新密码"
              />
            </div>
            <button
              className="woo-button woo-button-m woo-button-flat woo-button-primary"
              onClick={handleChangePassword}
            >
              提交修改
            </button>
          </div>
        </ContentBox>
      </div>
    </div>
  );
}
