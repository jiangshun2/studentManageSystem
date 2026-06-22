import { useState } from 'react';
import { User, Lock, Mail, Phone, School, Calendar, Hash, Edit3, Save, Camera, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { studentById, teacherById, admins } from '../../mock/data';
import { ContentBox } from '../../components/UI';
import { message } from '../../components/MessageHost';
import { confirm } from '../../components/ModalHost';

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  if (!user) return null;
  const stu = studentById(user.id);
  if (!stu) return null;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: stu.name,
    phone: stu.phone,
    email: stu.email,
  });
  const [pwdForm, setPwdForm] = useState({ old: '', neu: '', confirm: '' });

  const handleSave = () => {
    updateUser({ ...stu, ...form });
    setEditing(false);
    message('资料已保存', 'success');
  };

  const handleChangePassword = () => {
    if (!pwdForm.old || !pwdForm.neu || !pwdForm.confirm) {
      message('请填写完整密码信息', 'warning');
      return;
    }
    if (pwdForm.old !== stu.password) {
      message('原密码错误', 'error');
      return;
    }
    if (pwdForm.neu !== pwdForm.confirm) {
      message('两次新密码输入不一致', 'error');
      return;
    }
    if (pwdForm.neu.length < 8 || pwdForm.neu.length > 20) {
      message('密码长度需 8-20 位', 'warning');
      return;
    }
    if (!/[a-z]/.test(pwdForm.neu) || !/[A-Z]/.test(pwdForm.neu) || !/\d/.test(pwdForm.neu)) {
      message('密码需包含大小写字母和数字', 'warning');
      return;
    }
    updateUser({ ...stu, password: pwdForm.neu });
    setPwdForm({ old: '', neu: '', confirm: '' });
    message('密码修改成功', 'success');
  };

  const handleDownloadCert = () => {
    confirm({
      title: '学籍证明下载',
      content: <div style={{ fontSize: 14 }}>将生成并下载 PDF 格式的学籍证明文件。</div>,
      onOk: () => message('学籍证明已开始下载', 'success'),
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
      {/* 左侧 - 头像卡片 */}
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
              {stu.name.charAt(0)}
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
          <h3 style={{ fontSize: 18, marginBottom: 4 }}>{stu.name}</h3>
          <div style={{ fontSize: 13, color: 'var(--w-sub)' }}>
            {stu.major} · {stu.className}
          </div>
          <div style={{ fontSize: 12, color: 'var(--w-sub)', marginTop: 8 }}>
            {stu.studentNo}
          </div>
          <button
            className="woo-button woo-button-m woo-button-line woo-button-primary"
            style={{ marginTop: 16, width: '100%' }}
            onClick={handleDownloadCert}
          >
            <Download size={14} />
            学籍证明 PDF
          </button>
        </div>

        <div className="content-box">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>学籍信息</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--w-sub)' }}>学号</div>
              <div style={{ fontSize: 14 }}>{stu.studentNo}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--w-sub)' }}>入学年份</div>
              <div style={{ fontSize: 14 }}>{stu.enrollmentYear}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--w-sub)' }}>性别</div>
              <div style={{ fontSize: 14 }}>{stu.gender}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--w-sub)' }}>专业</div>
              <div style={{ fontSize: 14 }}>{stu.major}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--w-sub)' }}>班级</div>
              <div style={{ fontSize: 14 }}>{stu.className}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--w-sub)' }}>账号状态</div>
              <div style={{ fontSize: 14, color: 'var(--w-success)' }}>● 正常</div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧 - 表单 */}
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
                    setForm({ name: stu.name, phone: stu.phone, email: stu.email });
                    setEditing(false);
                  }}
                >
                  取消
                </button>
                <button
                  className="woo-button woo-button-s woo-button-flat woo-button-primary"
                  onClick={handleSave}
                >
                  <Save size={14} />
                  保存
                </button>
              </div>
            ) : (
              <button
                className="woo-button woo-button-s woo-button-line woo-button-primary"
                onClick={() => setEditing(true)}
              >
                <Edit3 size={14} />
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
              <label className="form-label">学号（只读）</label>
              <input className="woo-input" disabled value={stu.studentNo} />
            </div>
            <div className="form-item">
              <label className="form-label">性别（只读）</label>
              <input className="woo-input" disabled value={stu.gender} />
            </div>
            <div className="form-item">
              <label className="form-label">专业（只读）</label>
              <input className="woo-input" disabled value={stu.major} />
            </div>
            <div className="form-item">
              <label className="form-label">班级（只读）</label>
              <input className="woo-input" disabled value={stu.className} />
            </div>
            <div className="form-item">
              <label className="form-label">入学年份（只读）</label>
              <input className="woo-input" disabled value={String(stu.enrollmentYear)} />
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
