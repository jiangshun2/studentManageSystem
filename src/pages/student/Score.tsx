import { useMemo, useState } from 'react';
import { Search, Download, Filter, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  scores,
  courseById,
  teacherById,
  semesterOptions,
  getScoreLevel,
} from '../../mock/data';
import { ContentBox } from '../../components/UI';
import { message } from '../../components/MessageHost';

export default function StudentScore() {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [semester, setSemester] = useState('全部');
  const [level, setLevel] = useState('全部');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const myScores = useMemo(
    () => scores.filter((s) => s.studentId === user?.id),
    [user]
  );

  const filtered = useMemo(() => {
    return myScores.filter((s) => {
      const c = courseById(s.courseId);
      if (keyword && !c?.name.includes(keyword)) return false;
      if (semester !== '全部' && `${s.year}-${s.semester}` !== semester) return false;
      if (level !== '全部' && s.level !== level) return false;
      return true;
    });
  }, [myScores, keyword, semester, level]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handleExport = () => {
    if (filtered.length === 0) {
      message('当前筛选无数据', 'warning');
      return;
    }
    // 简单生成 CSV
    const headers = ['课程号', '课程名', '学分', '任课教师', '成绩', '绩点', '等级', '考试时间'];
    const rows = filtered.map((s) => {
      const c = courseById(s.courseId)!;
      const t = teacherById(s.teacherId);
      return [
        c.courseNo,
        c.name,
        c.credits,
        t?.name ?? '',
        s.total,
        s.gpa,
        s.level,
        s.examTime,
      ];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const stuNo =
      user && user.role === 'student' ? (user as any).studentNo : 'export';
    a.download = `成绩单_${stuNo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message(`已导出 ${filtered.length} 条成绩`, 'success');
  };

  return (
    <div>
      <ContentBox
        title={
          <div className="flex-align-center" style={{ gap: 8 }}>
            <Award size={18} color="var(--w-brand)" />
            <span>成绩查询</span>
          </div>
        }
        extra={
          <div className="flex-align-center" style={{ gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--w-sub)' }}>
              共 {filtered.length} 条记录
            </span>
            <button
              className="woo-button woo-button-s woo-button-line woo-button-primary"
              onClick={handleExport}
            >
              <Download size={14} />
              导出 Excel
            </button>
          </div>
        }
      >
        {/* 筛选区 */}
        <div
          className="flex-align-center"
          style={{
            gap: 12,
            padding: 16,
            background: 'var(--w-page-bg)',
            borderRadius: 8,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div className="flex-align-center" style={{ gap: 6 }}>
            <Filter size={14} color="var(--w-sub)" />
            <span style={{ fontSize: 13, color: 'var(--w-sub)' }}>学期：</span>
            <select
              className="woo-select"
              style={{ width: 140, height: 32 }}
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setPage(1);
              }}
            >
              <option value="全部">全部学期</option>
              {semesterOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-align-center" style={{ gap: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--w-sub)' }}>等级：</span>
            <select
              className="woo-select"
              style={{ width: 120, height: 32 }}
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setPage(1);
              }}
            >
              <option>全部</option>
              <option>优秀</option>
              <option>良好</option>
              <option>中等</option>
              <option>及格</option>
              <option>不及格</option>
            </select>
          </div>

          <div className="flex-align-center" style={{ flex: 1, minWidth: 200 }}>
            <div className="woo-input-wrap" style={{ maxWidth: 280 }}>
              <Search size={14} color="var(--w-sub)" style={{ marginRight: 6 }} />
              <input
                placeholder="搜索课程名称"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* 表格 */}
        <table className="woo-table">
          <thead>
            <tr>
              <th>课程号</th>
              <th>课程名称</th>
              <th>学分</th>
              <th>类别</th>
              <th>任课教师</th>
              <th>成绩</th>
              <th>绩点</th>
              <th>等级</th>
              <th>考试时间</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: 'center', padding: 40, color: 'var(--w-sub)' }}
                >
                  暂无符合条件的成绩记录
                </td>
              </tr>
            ) : (
              paged.map((s) => {
                const c = courseById(s.courseId)!;
                const t = teacherById(s.teacherId);
                return (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--w-sub)', fontSize: 12 }}>{c.courseNo}</td>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.credits}</td>
                    <td>
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
                      >
                        {c.category}
                      </span>
                    </td>
                    <td>{t?.name ?? '-'}</td>
                    <td
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
                    </td>
                    <td>{s.gpa.toFixed(1)}</td>
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
                    <td style={{ color: 'var(--w-sub)' }}>{s.examTime}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* 分页 */}
        {totalPages > 1 && (
          <div
            className="flex-align-center"
            style={{
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: 16,
            }}
          >
            <button
              className="woo-button woo-button-s woo-button-line woo-button-default"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </button>
            <span style={{ fontSize: 13, color: 'var(--w-sub)' }}>
              第 {page} / {totalPages} 页
            </span>
            <button
              className="woo-button woo-button-s woo-button-line woo-button-default"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </button>
          </div>
        )}
      </ContentBox>
    </div>
  );
}
