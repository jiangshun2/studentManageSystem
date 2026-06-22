import { useState, useMemo } from 'react';
import { Check, X, Edit3, Download, Search, Filter, FileText, Settings } from 'lucide-react';
import {
  scores,
  students,
  teachers,
  courses,
  courseById,
  studentById,
  teacherById,
  scoreApplications,
} from '../../mock/data';
import { ContentBox } from '../../components/UI';
import { message } from '../../components/MessageHost';
import { confirm } from '../../components/ModalHost';

type Tab = 'query' | 'applications' | 'archive';

export default function AdminScores() {
  const [tab, setTab] = useState<Tab>('query');
  const [keyword, setKeyword] = useState('');
  const [filterCourse, setFilterCourse] = useState('全部');
  const [filterTerm, setFilterTerm] = useState('全部');
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return scores.filter((s) => {
      const stu = studentById(s.studentId);
      const c = courseById(s.courseId);
      if (keyword) {
        const hit =
          stu?.name.includes(keyword) ||
          stu?.studentNo.includes(keyword) ||
          c?.name.includes(keyword);
        if (!hit) return false;
      }
      if (filterCourse !== '全部' && s.courseId !== filterCourse) return false;
      if (filterTerm !== '全部' && `${s.year}-${s.semester}` !== filterTerm) return false;
      return true;
    });
  }, [keyword, filterCourse, filterTerm]);

  const handleApprove = (id: string) => {
    const app = scoreApplications.find((a) => a.id === id);
    if (!app) return;
    confirm({
      title: '审批通过',
      content: (
        <div>
          <p>确认通过此成绩修改申请？</p>
          <p style={{ marginTop: 8, color: 'var(--w-sub)', fontSize: 13 }}>
            原成绩 {app.oldTotal} → 新成绩 {app.newTotal}
          </p>
        </div>
      ),
      onOk: () => {
        app.status = '已通过';
        app.handledAt = new Date().toISOString().slice(0, 10);
        message('已通过申请', 'success');
      },
    });
  };

  const handleReject = (id: string) => {
    const app = scoreApplications.find((a) => a.id === id);
    if (!app) return;
    confirm({
      title: '审批拒绝',
      content: (
        <div>
          <p>确认拒绝此成绩修改申请？</p>
          <textarea
            className="woo-input"
            rows={2}
            placeholder="拒绝原因..."
            style={{ marginTop: 8, height: 'auto', padding: 8 }}
          />
        </div>
      ),
      onOk: () => {
        app.status = '已拒绝';
        app.handledAt = new Date().toISOString().slice(0, 10);
        message('已拒绝申请', 'warning');
      },
    });
  };

  return (
    <div>
      <ContentBox>
        <div
          className="flex-align-center"
          style={{
            borderBottom: '1px solid var(--w-divider)',
            marginBottom: 16,
            gap: 24,
          }}
        >
          {[
            { key: 'query' as const, label: '成绩查询' },
            { key: 'applications' as const, label: `修改审批 (${scoreApplications.filter((a) => a.status === '待审核').length})` },
            { key: 'archive' as const, label: '归档管理' },
          ].map((t) => (
            <div
              key={t.key}
              onClick={() => setTab(t.key)}
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

        {tab === 'query' && (
          <>
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
                <div className="woo-input-wrap" style={{ width: 220 }}>
                  <input
                    placeholder="搜索学生/课程"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </div>
              <select
                className="woo-select"
                style={{ width: 200, height: 32 }}
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="全部">全部课程</option>
                {courses.slice(0, 30).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                className="woo-select"
                style={{ width: 120, height: 32 }}
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
              >
                <option>全部</option>
                <option>2024-春</option>
                <option>2024-秋</option>
                <option>2023-春</option>
                <option>2023-秋</option>
              </select>
              <div className="flex-1" />
              <button
                className="woo-button woo-button-s woo-button-line woo-button-primary"
                onClick={() => message(`已导出 ${filtered.length} 条`, 'success')}
              >
                <Download size={14} />
                导出 Excel
              </button>
              <button
                className="woo-button woo-button-s woo-button-line woo-button-primary"
                onClick={() => message('公示期设置已打开', 'info')}
              >
                <Settings size={14} />
                公示期设置
              </button>
            </div>

            <table className="woo-table">
              <thead>
                <tr>
                  <th>学号</th>
                  <th>姓名</th>
                  <th>课程</th>
                  <th>任课教师</th>
                  <th>学期</th>
                  <th>成绩</th>
                  <th>等级</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 30).map((s) => {
                  const stu = studentById(s.studentId);
                  const c = courseById(s.courseId);
                  const t = teacherById(s.teacherId);
                  return (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--w-sub)', fontSize: 12 }}>{stu?.studentNo}</td>
                      <td style={{ fontWeight: 500 }}>{stu?.name}</td>
                      <td>{c?.name}</td>
                      <td>{t?.name}</td>
                      <td style={{ fontSize: 12 }}>{s.year} {s.semester}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color:
                              s.total >= 90
                                ? 'var(--grade-excellent)'
                                : s.total >= 80
                                ? 'var(--grade-good)'
                                : s.total >= 70
                                ? 'var(--grade-medium)'
                                : s.total >= 60
                                ? 'var(--grade-pass)'
                                : 'var(--grade-fail)',
                          }}
                        >
                          {s.total}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            'woo-tag ' +
                            (s.level === '优秀' ? 'woo-tag-success' :
                              s.level === '良好' ? 'woo-tag-warning' :
                              s.level === '中等' ? 'woo-tag-primary' :
                              s.level === '及格' ? 'woo-tag-info' : 'woo-tag-danger')
                          }
                        >
                          {s.level}
                        </span>
                      </td>
                      <td>
                        <span className="woo-tag">{s.status}</span>
                      </td>
                      <td>
                        <button
                          className="woo-button woo-button-s woo-button-line woo-button-default"
                          style={{ padding: '2px 8px' }}
                          onClick={() => setEditingId(s.id)}
                        >
                          <Edit3 size={12} />
                          修改
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div
              className="flex-between"
              style={{ marginTop: 16, color: 'var(--w-sub)', fontSize: 13 }}
            >
              <span>显示前 30 条，共 {filtered.length} 条</span>
              <div className="flex-align-center" style={{ gap: 6 }}>
                <button className="woo-button woo-button-s woo-button-line woo-button-default">上一页</button>
                <span>1 / {Math.ceil(filtered.length / 30)}</span>
                <button className="woo-button woo-button-s woo-button-line woo-button-default">下一页</button>
              </div>
            </div>
          </>
        )}

        {tab === 'applications' && (
          <div>
            {scoreApplications.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--w-sub)' }}>
                暂无申请
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {scoreApplications.map((app) => {
                  const score = scores.find((s) => s.id === app.scoreId);
                  const stu = score ? studentById(score.studentId) : null;
                  const c = score ? courseById(score.courseId) : null;
                  const t = teacherById(app.teacherId);
                  return (
                    <div
                      key={app.id}
                      style={{
                        padding: 16,
                        border: '1px solid var(--w-border)',
                        borderRadius: 8,
                        background: app.status === '待审核' ? '#FFFBE6' : '#fff',
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: 8 }}>
                        <div className="flex-align-center" style={{ gap: 8 }}>
                          <FileText size={16} color="var(--w-brand)" />
                          <span style={{ fontWeight: 600 }}>{c?.name}</span>
                          <span style={{ color: 'var(--w-sub)' }}>
                            · {stu?.name} ({stu?.studentNo})
                          </span>
                        </div>
                        <span
                          className={
                            'woo-tag ' +
                            (app.status === '待审核'
                              ? 'woo-tag-warning'
                              : app.status === '已通过'
                              ? 'woo-tag-success'
                              : 'woo-tag-danger')
                          }
                        >
                          {app.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--w-sub)', marginBottom: 8 }}>
                        申请教师：{t?.name} · 申请时间：{app.createdAt}
                      </div>
                      <div style={{ fontSize: 14, marginBottom: 8 }}>
                        修改原因：{app.reason}
                      </div>
                      <div className="flex-align-center" style={{ gap: 16, marginBottom: 12 }}>
                        <span style={{ fontSize: 14 }}>
                          原成绩：
                          <span style={{ color: 'var(--w-special)', fontWeight: 600, marginLeft: 4 }}>
                            {app.oldTotal}
                          </span>
                        </span>
                        <span style={{ fontSize: 20 }}>→</span>
                        <span style={{ fontSize: 14 }}>
                          新成绩：
                          <span style={{ color: 'var(--w-success)', fontWeight: 600, marginLeft: 4 }}>
                            {app.newTotal}
                          </span>
                        </span>
                      </div>
                      {app.status === '待审核' ? (
                        <div className="flex" style={{ gap: 8 }}>
                          <button
                            className="woo-button woo-button-s woo-button-flat woo-button-primary"
                            onClick={() => handleApprove(app.id)}
                          >
                            <Check size={14} />
                            通过
                          </button>
                          <button
                            className="woo-button woo-button-s woo-button-line woo-button-default"
                            onClick={() => handleReject(app.id)}
                          >
                            <X size={14} />
                            拒绝
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: 'var(--w-sub)' }}>
                          处理时间：{app.handledAt} · {app.comment}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'archive' && (
          <div>
            <div
              className="flex-align-center"
              style={{
                gap: 12,
                padding: 12,
                background: 'var(--w-page-bg)',
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 13 }}>归档年度：</span>
              <select className="woo-select" style={{ width: 120, height: 32 }}>
                <option>2023</option>
                <option>2022</option>
                <option>2021</option>
              </select>
              <div className="flex-1" />
              <button
                className="woo-button woo-button-s woo-button-line woo-button-primary"
                onClick={() => message('已执行归档操作', 'success')}
              >
                立即归档
              </button>
            </div>
            <table className="woo-table">
              <thead>
                <tr>
                  <th>归档年度</th>
                  <th>学期</th>
                  <th>课程数</th>
                  <th>学生数</th>
                  <th>成绩记录</th>
                  <th>归档时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { year: '2023', term: '秋', courses: 286, students: 26800, records: 25600, archived: '2024-01-15' },
                  { year: '2023', term: '春', courses: 270, students: 26200, records: 24800, archived: '2023-07-10' },
                  { year: '2022', term: '秋', courses: 258, students: 25500, records: 24200, archived: '2023-01-12' },
                ].map((a, i) => (
                  <tr key={i}>
                    <td>{a.year}</td>
                    <td>{a.term}</td>
                    <td>{a.courses}</td>
                    <td>{a.students.toLocaleString()}</td>
                    <td>{a.records.toLocaleString()}</td>
                    <td style={{ color: 'var(--w-sub)' }}>{a.archived}</td>
                    <td>
                      <button className="woo-button woo-button-s woo-button-line woo-button-default" style={{ padding: '2px 8px' }}>
                        <Download size={12} />
                        下载
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContentBox>
    </div>
  );
}
