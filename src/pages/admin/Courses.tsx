import { useMemo, useState } from 'react';
import { Plus, Edit3, Trash2, Search, UserCheck, BookOpen } from 'lucide-react';
import {
  courses,
  teachers,
  courseById,
  teacherById,
  courseCategories,
} from '../../mock/data';
import { ContentBox } from '../../components/UI';
import { message } from '../../components/MessageHost';
import { confirm } from '../../components/ModalHost';

export default function AdminCourses() {
  const [keyword, setKeyword] = useState('');
  const [filterCat, setFilterCat] = useState('全部');
  const [filterYear, setFilterYear] = useState('全部');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (keyword && !c.name.includes(keyword) && !c.courseNo.includes(keyword)) return false;
      if (filterCat !== '全部' && c.category !== filterCat) return false;
      if (filterYear !== '全部' && String(c.year) !== filterYear) return false;
      return true;
    });
  }, [keyword, filterCat, filterYear]);

  const handleDelete = (id: string) => {
    const c = courseById(id);
    if (!c) return;
    confirm({
      title: '删除课程',
      content: <div>确认删除课程 <b>{c.name}</b>？</div>,
      danger: true,
      okText: '确认删除',
      onOk: () => message('课程已删除', 'success'),
    });
  };

  const handleAssign = (id: string) => {
    const c = courseById(id);
    if (!c) return;
    confirm({
      title: '分配任课教师',
      content: (
        <div>
          <div className="form-item">
            <label className="form-label">选择教师</label>
            <select className="woo-select">
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.department} · {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      ),
      onOk: () => message('任课教师分配成功', 'success'),
    });
  };

  return (
    <div>
      <ContentBox
        title={
          <div className="flex-align-center" style={{ gap: 8 }}>
            <BookOpen size={18} color="var(--w-brand)" />
            <span>课程库</span>
            <span
              style={{
                fontSize: 12,
                color: 'var(--w-sub)',
                fontWeight: 400,
                marginLeft: 4,
              }}
            >
              共 {courses.length} 门
            </span>
          </div>
        }
        extra={
          <button
            className="woo-button woo-button-s woo-button-flat woo-button-primary"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={14} />
            新增课程
          </button>
        }
      >
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
          <div className="flex-align-center" style={{ gap: 6, flex: 1, minWidth: 200 }}>
            <Search size={14} color="var(--w-sub)" />
            <div className="woo-input-wrap">
              <input
                placeholder="搜索课程号/课程名"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
          <select
            className="woo-select"
            style={{ width: 120, height: 32 }}
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option>全部</option>
            {courseCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            className="woo-select"
            style={{ width: 120, height: 32 }}
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option>全部</option>
            <option>2023</option>
            <option>2024</option>
            <option>2025</option>
          </select>
        </div>

        <table className="woo-table">
          <thead>
            <tr>
              <th>课程号</th>
              <th>课程名</th>
              <th>学分</th>
              <th>学时</th>
              <th>类别</th>
              <th>学期</th>
              <th>任课教师</th>
              <th>已选/容量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map((c) => {
              const t = teacherById(c.teacherId);
              return (
                <tr key={c.id}>
                  <td style={{ color: 'var(--w-sub)', fontSize: 12 }}>{c.courseNo}</td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.credits}</td>
                  <td>{c.hours}</td>
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
                  <td>{c.year} {c.semester}</td>
                  <td>{t?.name ?? '-'}</td>
                  <td>
                    <span style={{ color: c.selected > c.capacity ? 'var(--w-special)' : 'var(--w-main)' }}>
                      {c.selected} / {c.capacity}
                    </span>
                  </td>
                  <td>
                    <div className="flex-align-center" style={{ gap: 4 }}>
                      <button
                        className="woo-button woo-button-s woo-button-line woo-button-default"
                        style={{ padding: '2px 8px' }}
                        onClick={() => handleAssign(c.id)}
                        title="分配教师"
                      >
                        <UserCheck size={12} />
                      </button>
                      <button
                        className="woo-button woo-button-s woo-button-line woo-button-default"
                        style={{ padding: '2px 8px' }}
                        title="编辑"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        className="woo-button woo-button-s woo-button-line woo-button-default"
                        style={{ padding: '2px 8px', color: 'var(--w-special)' }}
                        onClick={() => handleDelete(c.id)}
                        title="删除"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
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
          <span>显示前 20 条，共 {filtered.length} 条</span>
          <div className="flex-align-center" style={{ gap: 6 }}>
            <button className="woo-button woo-button-s woo-button-line woo-button-default">上一页</button>
            <span>1 / {Math.ceil(filtered.length / 20)}</span>
            <button className="woo-button woo-button-s woo-button-line woo-button-default">下一页</button>
          </div>
        </div>
      </ContentBox>

      {showCreate && (
        <div
          className="woo-modal-mask"
          onClick={() => setShowCreate(false)}
        >
          <div className="woo-modal-wrap" onClick={() => setShowCreate(false)}>
            <div
              className="woo-modal-main"
              style={{ width: 560 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="woo-modal-header">新增课程</div>
              <div className="woo-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-item">
                    <label className="form-label"><span className="required">*</span>课程号</label>
                    <input className="woo-input" placeholder="如：C2024001" />
                  </div>
                  <div className="form-item">
                    <label className="form-label"><span className="required">*</span>课程名</label>
                    <input className="woo-input" placeholder="课程中文名" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">英文名</label>
                    <input className="woo-input" placeholder="English Name" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">类别</label>
                    <select className="woo-select">
                      {courseCategories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-item">
                    <label className="form-label">学分</label>
                    <input className="woo-input" type="number" placeholder="如：3" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">学时</label>
                    <input className="woo-input" type="number" placeholder="如：48" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">开课学期</label>
                    <select className="woo-select">
                      <option>2025 春</option>
                      <option>2025 秋</option>
                    </select>
                  </div>
                  <div className="form-item">
                    <label className="form-label">课程容量</label>
                    <input className="woo-input" type="number" placeholder="如：100" />
                  </div>
                </div>
                <div className="form-item">
                  <label className="form-label">课程简介</label>
                  <textarea
                    className="woo-input"
                    rows={3}
                    placeholder="课程简介..."
                    style={{ height: 'auto', padding: 8 }}
                  />
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
                    message('课程已创建', 'success');
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
