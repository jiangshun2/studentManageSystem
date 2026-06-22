import { useMemo, useState } from 'react';
import { Save, Send, Upload, Download, Edit3, Check, X, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  courses,
  scores as allScores,
  studentById,
  courseById,
  teacherById,
  calcTotal,
  scoreToGpa,
  getScoreLevel,
  Score,
} from '../../mock/data';
import { ContentBox } from '../../components/UI';
import { message } from '../../components/MessageHost';
import { confirm } from '../../components/ModalHost';

export default function TeacherScore() {
  const { user } = useAuth();
  if (!user || user.role !== 'teacher') return null;
  const teacher = teacherById(user.id)!;

  const myCourses = useMemo(
    () => courses.filter((c) => c.teacherId === user.id && c.year === 2024),
    [user]
  );

  const [selectedCourseId, setSelectedCourseId] = useState(myCourses[0]?.id ?? '');
  const [editing, setEditing] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<Score>>>({});

  const selectedCourse = courseById(selectedCourseId);

  // 当前课程的学生成绩
  const courseScores = useMemo(
    () => allScores.filter((s) => s.courseId === selectedCourseId),
    [selectedCourseId]
  );

  // 生成"学生 - 成绩"列表
  const studentList = useMemo(() => {
    return courseScores.map((s) => ({
      score: s,
      student: studentById(s.studentId)!,
    }));
  }, [courseScores]);

  const handleEdit = (scoreId: string) => {
    setEditing(scoreId);
    const s = courseScores.find((x) => x.id === scoreId);
    if (s) {
      setDrafts({ ...drafts, [scoreId]: { ...s } });
    }
  };

  const handleSaveRow = (scoreId: string) => {
    const draft = drafts[scoreId];
    if (!draft) return;
    const idx = allScores.findIndex((s) => s.id === scoreId);
    if (idx >= 0) {
      const total = calcTotal(
        selectedCourse?.category ?? '必修',
        draft.usual,
        draft.midterm,
        draft.final,
        draft.experiment
      );
      allScores[idx] = {
        ...allScores[idx],
        ...draft,
        total,
        gpa: scoreToGpa(total),
        level: getScoreLevel(total),
      };
    }
    setEditing(null);
    message('已保存草稿', 'success');
  };

  const handleCancelRow = (scoreId: string) => {
    const newDrafts = { ...drafts };
    delete newDrafts[scoreId];
    setDrafts(newDrafts);
    setEditing(null);
  };

  const updateDraft = (scoreId: string, key: keyof Score, value: number | undefined) => {
    setDrafts({
      ...drafts,
      [scoreId]: { ...drafts[scoreId], [key]: value },
    });
  };

  const handleSubmit = () => {
    confirm({
      title: '提交成绩审核',
      content: (
        <div>
          <p>本课程共有 {courseScores.length} 名学生成绩。</p>
          <p style={{ marginTop: 8 }}>提交后将进入审核流程，提交后修改需走审批。</p>
        </div>
      ),
      onOk: () => message('成绩已提交审核', 'success'),
    });
  };

  const handleApply = () => {
    confirm({
      title: '申请修改成绩',
      content: (
        <div>
          <p style={{ marginBottom: 12 }}>已提交成绩修改需经管理员审批，请填写修改原因：</p>
          <textarea
            className="woo-input"
            rows={3}
            placeholder="请说明修改原因..."
            style={{ height: 'auto', padding: 8 }}
          />
        </div>
      ),
      onOk: () => message('修改申请已提交，等待审核', 'success'),
    });
  };

  return (
    <div>
      <ContentBox
        title="选择课程"
        extra={
          <div className="flex-align-center" style={{ gap: 8 }}>
            <button
              className="woo-button woo-button-s woo-button-line woo-button-default"
              onClick={handleApply}
            >
              <Edit3 size={14} />
              申请修改
            </button>
            <button
              className="woo-button woo-button-s woo-button-line woo-button-primary"
              onClick={() => message('成绩模板已下载', 'success')}
            >
              <Download size={14} />
              下载模板
            </button>
            <button
              className="woo-button woo-button-s woo-button-line woo-button-primary"
              onClick={() => message('请选择 Excel 文件', 'info')}
            >
              <Upload size={14} />
              批量导入
            </button>
            <button
              className="woo-button woo-button-s woo-button-flat woo-button-primary"
              onClick={handleSubmit}
            >
              <Send size={14} />
              提交审核
            </button>
          </div>
        }
      >
        <div className="flex-align-center" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="flex-align-center" style={{ gap: 8, flex: 1 }}>
            <span style={{ fontSize: 13, color: 'var(--w-sub)' }}>本学期课程：</span>
            <select
              className="woo-select"
              style={{ maxWidth: 360 }}
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setEditing(null);
                setDrafts({});
              }}
            >
              {myCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseNo} {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>
          {selectedCourse && (
            <div className="flex-align-center" style={{ gap: 16, fontSize: 13, color: 'var(--w-sub)' }}>
              <span>学分：<b style={{ color: 'var(--w-main)' }}>{selectedCourse.credits}</b></span>
              <span>学时：<b style={{ color: 'var(--w-main)' }}>{selectedCourse.hours}</b></span>
              <span>学生：<b style={{ color: 'var(--w-main)' }}>{courseScores.length}</b></span>
            </div>
          )}
        </div>
      </ContentBox>

      <ContentBox
        title={
          selectedCourse ? (
            <div className="flex-align-center" style={{ gap: 8 }}>
              <FileSpreadsheet size={18} color="var(--w-brand)" />
              <span>{selectedCourse.name} · 成绩录入</span>
            </div>
          ) : (
            '成绩录入'
          )
        }
        extra={
          <span style={{ fontSize: 12, color: 'var(--w-sub)' }}>
            {selectedCourse?.category === '实践'
              ? '实践课公式：平时×30% + 实验×40% + 期末×30%'
              : '理论课公式：平时×20% + 期中×30% + 期末×50%'}
          </span>
        }
      >
        {!selectedCourse ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--w-sub)' }}>
            请选择课程
          </div>
        ) : studentList.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--w-sub)' }}>
            该课程暂无学生成绩
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="woo-table">
              <thead>
                <tr>
                  <th>学号</th>
                  <th>姓名</th>
                  <th>专业班级</th>
                  <th>平时 (20%)</th>
                  {selectedCourse.category !== '实践' && <th>期中 (30%)</th>}
                  <th>期末 (50%)</th>
                  {selectedCourse.category === '实践' && <th>实验 (40%)</th>}
                  <th>总评</th>
                  <th>等级</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {studentList.map(({ score, student }) => {
                  const draft = drafts[score.id] ?? score;
                  const isEditing = editing === score.id;
                  return (
                    <tr key={score.id}>
                      <td style={{ color: 'var(--w-sub)', fontSize: 12 }}>{student.studentNo}</td>
                      <td style={{ fontWeight: 500 }}>{student.name}</td>
                      <td style={{ fontSize: 12 }}>{student.major.slice(0, 2)} {student.className}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            className="woo-input"
                            style={{ width: 70, height: 28, padding: '0 8px' }}
                            value={draft.usual ?? ''}
                            onChange={(e) => updateDraft(score.id, 'usual', Number(e.target.value))}
                          />
                        ) : (
                          score.usual ?? '-'
                        )}
                      </td>
                      {selectedCourse.category !== '实践' && (
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              className="woo-input"
                              style={{ width: 70, height: 28, padding: '0 8px' }}
                              value={draft.midterm ?? ''}
                              onChange={(e) => updateDraft(score.id, 'midterm', Number(e.target.value))}
                            />
                          ) : (
                            score.midterm ?? '-'
                          )}
                        </td>
                      )}
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            className="woo-input"
                            style={{ width: 70, height: 28, padding: '0 8px' }}
                            value={draft.final ?? ''}
                            onChange={(e) => updateDraft(score.id, 'final', Number(e.target.value))}
                          />
                        ) : (
                          score.final ?? '-'
                        )}
                      </td>
                      {selectedCourse.category === '实践' && (
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              className="woo-input"
                              style={{ width: 70, height: 28, padding: '0 8px' }}
                              value={draft.experiment ?? ''}
                              onChange={(e) => updateDraft(score.id, 'experiment', Number(e.target.value))}
                            />
                          ) : (
                            score.experiment ?? '-'
                          )}
                        </td>
                      )}
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color:
                              score.total >= 90
                                ? 'var(--grade-excellent)'
                                : score.total >= 80
                                ? 'var(--grade-good)'
                                : score.total >= 70
                                ? 'var(--grade-medium)'
                                : score.total >= 60
                                ? 'var(--grade-pass)'
                                : 'var(--grade-fail)',
                          }}
                        >
                          {score.total}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            'woo-tag ' +
                            (score.level === '优秀' ? 'woo-tag-success' :
                              score.level === '良好' ? 'woo-tag-warning' :
                              score.level === '中等' ? 'woo-tag-primary' :
                              score.level === '及格' ? 'woo-tag-info' : 'woo-tag-danger')
                          }
                        >
                          {score.level}
                        </span>
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="flex-align-center" style={{ gap: 6 }}>
                            <button
                              className="woo-button woo-button-s woo-button-flat woo-button-primary"
                              style={{ padding: '2px 8px', fontSize: 12 }}
                              onClick={() => handleSaveRow(score.id)}
                            >
                              <Check size={12} />
                            </button>
                            <button
                              className="woo-button woo-button-s woo-button-line woo-button-default"
                              style={{ padding: '2px 8px', fontSize: 12 }}
                              onClick={() => handleCancelRow(score.id)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="woo-button woo-button-s woo-button-line woo-button-default"
                            style={{ padding: '2px 8px' }}
                            onClick={() => handleEdit(score.id)}
                          >
                            <Edit3 size={12} />
                            编辑
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ContentBox>
    </div>
  );
}
