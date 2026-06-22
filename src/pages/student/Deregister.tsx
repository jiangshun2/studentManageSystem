import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ContentBox } from '../../components/UI';
import { message } from '../../components/MessageHost';
import { confirm } from '../../components/ModalHost';

const reasons = [
  '已毕业，不再使用本系统',
  '转学/转专业',
  '个人原因主动退出',
  '隐私保护需要',
  '其他',
];

export default function StudentDeregister() {
  const { user, logout } = useAuth();
  const [step, setStep] = useState(1); // 1=须知 2=验证 3=选择原因 4=完成
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [reason, setReason] = useState(reasons[0]);
  const [customReason, setCustomReason] = useState('');

  const handleSendCode = () => {
    if (countdown > 0) return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    message('验证码已发送至手机（演示：123456）', 'success');
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (password !== user?.password) {
        message('密码错误', 'error');
        return;
      }
      if (code !== '123456') {
        message('验证码错误（演示请输入 123456）', 'error');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      confirm({
        title: '确认注销账号',
        content: (
          <div>
            <p style={{ marginBottom: 8 }}>您选择的原因是：</p>
            <p style={{ color: 'var(--w-brand)', fontWeight: 500 }}>
              {reason === '其他' ? customReason || '未填写' : reason}
            </p>
            <p style={{ marginTop: 12, color: 'var(--w-special)' }}>
              提交后将进入 7 天冷静期，期间可撤回申请。
            </p>
          </div>
        ),
        danger: true,
        okText: '确认注销',
        onOk: () => {
          setStep(4);
          setTimeout(() => {
            logout();
          }, 3000);
        },
      });
    }
  };

  if (step === 4) {
    return (
      <div className="content-box" style={{ textAlign: 'center', padding: 60 }}>
        <div
          style={{
            width: 80,
            height: 80,
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'rgba(82, 196, 26, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={48} color="var(--w-success)" />
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>注销申请已提交</h2>
        <p style={{ color: 'var(--w-sub)', fontSize: 14, marginBottom: 20 }}>
          您的账号已进入 7 天冷静期，到期后将自动完成注销。
        </p>
        <p style={{ color: 'var(--w-sub)', fontSize: 13 }}>
          3 秒后自动退出登录...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* 步骤条 */}
      <ContentBox>
        <div
          className="flex-align-center"
          style={{ gap: 8, justifyContent: 'center', padding: '8px 0' }}
        >
          {['阅读须知', '身份验证', '选择原因'].map((label, i) => {
            const idx = i + 1;
            const active = step >= idx;
            return (
              <div
                key={i}
                className="flex-align-center"
                style={{ gap: 8 }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: active ? 'var(--w-brand)' : '#f0f1f4',
                    color: active ? '#fff' : 'var(--w-sub)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {idx}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: active ? 'var(--w-main)' : 'var(--w-sub)',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {label}
                </span>
                {i < 2 && (
                  <div
                    style={{
                      width: 40,
                      height: 1,
                      background: step > idx ? 'var(--w-brand)' : '#f0f1f4',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </ContentBox>

      {step === 1 && (
        <ContentBox title="注销须知" extra={<AlertTriangle size={18} color="var(--w-warning)" />}>
          <div
            style={{
              background: '#FFF7E6',
              border: '1px solid #FFD591',
              borderRadius: 6,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#874D00' }}>
              请仔细阅读以下事项
            </div>
            <ul style={{ paddingLeft: 20, color: '#874D00', fontSize: 13, lineHeight: 1.8 }}>
              <li>账号注销申请提交后将进入 7 天冷静期，冷静期内可撤回申请</li>
              <li>您的个人基本信息（姓名、手机号、邮箱、头像等）将被清除</li>
              <li>历史成绩数据将归档保留，但不再与本人关联</li>
              <li>已发布的内容将进行匿名化处理</li>
              <li>注销审核由管理员处理，审核结果将通过短信通知</li>
            </ul>
          </div>
          <div className="flex-center" style={{ gap: 12 }}>
            <button
              className="woo-button woo-button-m woo-button-line woo-button-default"
              onClick={() => window.history.back()}
            >
              取消
            </button>
            <button
              className="woo-button woo-button-m woo-button-flat woo-button-danger"
              onClick={handleNext}
            >
              我已知晓，继续
            </button>
          </div>
        </ContentBox>
      )}

      {step === 2 && (
        <ContentBox title="身份验证" extra={<Lock size={18} color="var(--w-brand)" />}>
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <div className="form-item">
              <label className="form-label">
                <span className="required">*</span>登录密码
              </label>
              <input
                type="password"
                className="woo-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入登录密码"
              />
            </div>
            <div className="form-item">
              <label className="form-label">
                <span className="required">*</span>手机验证码
              </label>
              <div className="flex" style={{ gap: 8 }}>
                <input
                  className="woo-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6 位验证码"
                  style={{ flex: 1 }}
                />
                <button
                  className="woo-button woo-button-m woo-button-line woo-button-primary"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--w-sub)', marginTop: 4 }}>
                演示环境请输入：123456
              </div>
            </div>
            <div className="flex-center" style={{ gap: 12, marginTop: 20 }}>
              <button
                className="woo-button woo-button-m woo-button-line woo-button-default"
                onClick={() => setStep(1)}
              >
                上一步
              </button>
              <button
                className="woo-button woo-button-m woo-button-flat woo-button-primary"
                onClick={handleNext}
              >
                下一步
              </button>
            </div>
          </div>
        </ContentBox>
      )}

      {step === 3 && (
        <ContentBox title="注销原因">
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <div className="form-item">
              <label className="form-label">请选择注销原因（单选）</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reasons.map((r) => (
                  <label
                    key={r}
                    className="flex-align-center"
                    style={{
                      gap: 8,
                      padding: '10px 14px',
                      border: '1px solid var(--w-border)',
                      borderRadius: 6,
                      cursor: 'pointer',
                      background: reason === r ? 'var(--w-hover)' : '#fff',
                      borderColor: reason === r ? 'var(--w-brand)' : 'var(--w-border)',
                    }}
                  >
                    <input
                      type="radio"
                      name="reason"
                      checked={reason === r}
                      onChange={() => setReason(r)}
                    />
                    <span style={{ fontSize: 14 }}>{r}</span>
                  </label>
                ))}
              </div>
            </div>
            {reason === '其他' && (
              <div className="form-item">
                <label className="form-label">请详细说明</label>
                <textarea
                  className="woo-input"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                  style={{ height: 'auto', padding: 8 }}
                  placeholder="请输入具体原因"
                />
              </div>
            )}
            <div className="flex-center" style={{ gap: 12, marginTop: 20 }}>
              <button
                className="woo-button woo-button-m woo-button-line woo-button-default"
                onClick={() => setStep(2)}
              >
                上一步
              </button>
              <button
                className="woo-button woo-button-m woo-button-flat woo-button-danger"
                onClick={handleNext}
              >
                提交注销申请
              </button>
            </div>
          </div>
        </ContentBox>
      )}
    </div>
  );
}
