import { useState, useMemo } from 'react';
import { Edit3, FileText, Upload, Download, Users, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  courses,
  teacherById,
  studentById,
  scores,
} from '../../mock/data';
import { ContentBox } from '../../components/UI';
import { message } from '../../components/MessageHost';
import { confirm } from '../../components/ModalHost';

export default function TeacherCourse() {
  const { user } = useAuth();
  if (!user || user.role !== 'teacher') return null;

  const myCourses = useMemo(
    () => courses.filter((c) => c.teacherId === user.id),
    [user]
  );

  const [selectedId, setSelectedId] = useState(myCourses[0]?.id ?? '');
  const selected = myCourses.find((c) => c.id === selectedId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    description: selected?.description ?? '',
    syllabus: selected?.syllabus ?? '',
  });

  const studentList = useMemo(() => {
    if (!selected) return [];
    return scores
      .filter((s) => s.courseId === selected.id)
      .map((s) => studentById(s.studentId)!)
      .filter(Boolean);
  }, [selected]);

  const handleSave = () => {
    message('课程信息已保存', 'success');
    setEditing(false);
  };

  const handlePublish = () => {
    confirm({
      title: '发布课程公告',
      content: (
        <div>
          <div className="form-item">
            <label className="form-label">公告标题</label>
            <input className="woo-input" placeholder="请输入公告标题" />
          </div>
          <div className="form-item">
            <label className="form-label">公告内容</label>
            <textarea
              className="woo-input"
              rows={4}
              placeholder="请输入公告内容..."
              style={{ height: 'auto', padding: 8 }}
            />
          </div>
        </div>
      ),
      onOk: () => message('公告已发布，已通知选课学生', 'success'),
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
      {/* 左侧 - 课程列表 */}
      <ContentBox title="我的课程">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {myCourses.map((c) => {
            const active = c.id === selectedId;
            return (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id);
                  setEditing(false);
                  setForm({ description: c.description, syllabus: c.syllabus ?? '' });
                }}
                style={{
                  padding: 12,
                  borderRadius: 6,
                  border: active ? '1px solid var(--w-brand)' : '1px solid var(--w-border)',
                  background: active ? 'var(--w-hover)' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <div
                  className="flex-between"
                  style={{ marginBottom: 4 }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--w-brand)' : 'var(--w-main)' }}>
                    {c.name}
                  </span>
                  <span
                    className={
                      'woo-tag ' +
                      (c.category === '必修'
                        ? 'woo-tag-primary'
                        : c.category === '选修'
                        ? 'woo-tag-info'
                        : c.category === '实践'
                        ? 'woo-tag-warning'
                        : '')
                    }
                    style={{ fontSize: 10 }}
                  >
                    {c.category}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--w-sub)' }}>
                  {c.year} {c.semester} · {c.credits} 学分 · {c.selected}人选
                </div>
              </div>
            );
          })}
        </div>
      </ContentBox>

      {/* 右侧 - 课程详情 */}
      {!selected ? (
        <ContentBox>
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--w-sub)' }}>
            请选择左侧课程
          </div>
        </ContentBox>
      ) : (
        <div>
          <ContentBox
            title={
              <div className="flex-align-center" style={{ gap: 8 }}>
                <BookOpen size={18} color="var(--w-brand)" />
                <span>{selected.name}</span>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--w-sub)',
                    fontWeight: 400,
                    marginLeft: 8,
                  }}
                >
                  {selected.courseNo}
                </span>
              </div>
            }
            extra={
              editing ? (
                <div className="flex-align-center" style={{ gap: 8 }}>
                  <button
                    className="woo-button woo-button-s woo-button-line woo-button-default"
                    onClick={() => setEditing(false)}
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
                  <Edit3 size={14} />
                  编辑
                </button>
              )
            }
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div style={{ padding: 12, background: '#FAFAFA', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: 'var(--w-sub)' }}>学分</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{selected.credits}</div>
              </div>
              <div style={{ padding: 12, background: '#FAFAFA', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: 'var(--w-sub)' }}>学时</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{selected.hours}</div>
              </div>
              <div style={{ padding: 12, background: '#FAFAFA', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: 'var(--w-sub)' }}>已选/容量</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{selected.selected}/{selected.capacity}</div>
              </div>
              <div style={{ padding: 12, background: '#FAFAFA', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: 'var(--w-sub)' }}>学期</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{selected.year} {selected.semester}</div>
              </div>
            </div>

            <div className="form-item">
              <label className="form-label">课程简介</label>
              {editing ? (
                <textarea
                  className="woo-input"
                  rows={3}
                  style={{ height: 'auto', padding: 8 }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              ) : (
                <div style={{ fontSize: 14, color: 'var(--w-main)', lineHeight: 1.7 }}>
                  {selected.description}
                </div>
              )}
            </div>

            <div className="form-item">
              <label className="form-label">教学大纲</label>
              {editing ? (
                <textarea
                  className="woo-input"
                  rows={6}
                  style={{ height: 'auto', padding: 8, fontFamily: 'monospace' }}
                  value={form.syllabus}
                  onChange={(e) => setForm({ ...form, syllabus: e.target.value })}
                />
              ) : (
                <pre
                  style={{
                    fontSize: 13,
                    color: 'var(--w-main)',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    margin: 0,
                    background: '#FAFAFA',
                    padding: 16,
                    borderRadius: 6,
                  }}
                >
                  {selected.syllabus}
                </pre>
              )}
            </div>
          </ContentBox>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <ContentBox
              title={
                <div className="flex-align-center" style={{ gap: 6 }}>
                  <Upload size={16} color="var(--w-brand)" />
                  <span>教学资源</span>
                </div>
              }
              extra={
                <button
                  className="woo-button woo-button-s woo-button-line woo-button-primary"
                  onClick={() => message('已选择文件', 'info')}
                >
                  上传
                </button>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { name: '第1章 概述.pdf', size: '2.4 MB' },
                  { name: '第2章 基础理论.pptx', size: '5.6 MB' },
                  { name: '实验指导书.docx', size: '1.2 MB' },
                  { name: '参考教材清单.pdf', size: '320 KB' },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="flex-between"
                    style={{
                      padding: 10,
                      background: '#FAFAFA',
                      borderRadius: 6,
                    }}
                  >
                    <div className="flex-align-center" style={{ gap: 8 }}>
                      <FileText size={16} color="var(--w-brand)" />
                      <div>
                        <div style={{ fontSize: 13 }}>{f.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--w-sub)' }}>{f.size}</div>
                      </div>
                    </div>
                    <Download size={14} color="var(--w-sub)" style={{ cursor: 'pointer' }} />
                  </div>
                ))}
              </div>
            </ContentBox>

            <ContentBox
              title={
                <div className="flex-align-center" style={{ gap: 6 }}>
                  <Users size={16} color="var(--w-brand)" />
                  <span>选课学生 ({studentList.length})</span>
                </div>
              }
              extra={
                <div className="flex-align-center" style={{ gap: 6 }}>
                  <button
                    className="woo-button woo-button-s woo-button-line woo-button-default"
                    onClick={() => message('名单已导出', 'success')}
                  >
                    导出
                  </button>
                </div>
              }
            >
              <div style={{ maxHeight: 240, overflow: 'auto' }}>
                <table className="woo-table">
                  <thead>
                    <tr>
                      <th>学号</th>
                      <th>姓名</th>
                      <th>班级</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentList.map((stu) => (
                      <tr key={stu.id}>
                        <td style={{ color: 'var(--w-sub)', fontSize: 12 }}>{stu.studentNo}</td>
                        <td>{stu.name}</td>
                        <td style={{ fontSize: 12 }}>{stu.className}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ContentBox>
          </div>
        </div>
      )}
    </div>
  );
}
