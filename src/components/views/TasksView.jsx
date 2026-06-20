import React, { useState, useMemo } from 'react';
import { Plus, ListChecks, CheckCircle2, Clock, Flame, TrendingUp, Search, BarChart2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { categoryIcons } from '../../utils/constants';
import TaskNode from '../common/TaskNode';
import SEO from '../common/SEO';

const getTodayStr = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
};

const getYearDays = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);

    const startDay = startDate.getDay();
    const alignedStart = new Date(startDate);
    alignedStart.setDate(startDate.getDate() - startDay);

    const days = [];
    for (let i = 0; i < 371; i++) {
        const d = new Date(alignedStart);
        d.setDate(alignedStart.getDate() + i);
        days.push({
            date: d,
            isFuture: d > today,
            dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        });
    }
    return days;
};

// ─── Shared heatmap grid component ────────────────────────────────────────────
const HeatmapGrid = ({ days, getColor, getGlow, getTitle, onCellClick, accentColor }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{
            display: 'grid',
            gridTemplateRows: 'repeat(7, 11px)',
            gridAutoFlow: 'column',
            gap: '3px',
            overflowX: 'auto',
            padding: '10px',
            background: 'rgba(0,0,0,0.18)',
            borderRadius: '12px',
            scrollbarWidth: 'thin'
        }}>
            {days.map((dayObj, i) => {
                if (dayObj.isFuture) return (
                    <div key={i} style={{ width: '11px', height: '11px', borderRadius: '2px', background: 'transparent' }} />
                );
                return (
                    <button
                        key={i}
                        type="button"
                        title={getTitle(dayObj)}
                        onClick={() => onCellClick && onCellClick(dayObj)}
                        style={{
                            width: '11px', height: '11px',
                            borderRadius: '2px',
                            border: 'none',
                            background: getColor(dayObj),
                            cursor: onCellClick ? 'pointer' : 'default',
                            outline: 'none',
                            transition: 'transform 0.12s, background-color 0.15s',
                            boxShadow: getGlow(dayObj)
                        }}
                        onMouseEnter={e => { e.target.style.transform = 'scale(1.5)'; e.target.style.zIndex = '10'; }}
                        onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.zIndex = '1'; }}
                    />
                );
            })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Click blocks to toggle past dates</span>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Less</span>
                <div style={{ width: '9px', height: '9px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ width: '9px', height: '9px', borderRadius: '2px', background: `color-mix(in srgb, ${accentColor} 35%, rgba(255,255,255,0.05))` }} />
                <div style={{ width: '9px', height: '9px', borderRadius: '2px', background: accentColor }} />
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>More</span>
            </div>
        </div>
    </div>
);

// ─── Tab button ────────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, children, accent }) => (
    <button
        onClick={onClick}
        style={{
            padding: '0.6rem 1.3rem',
            borderRadius: '12px',
            fontSize: '0.87rem',
            fontWeight: 900,
            border: active ? `1px solid ${accent}55` : '1px solid transparent',
            background: active ? `color-mix(in srgb, ${accent} 18%, rgba(255,255,255,0.03))` : 'rgba(255,255,255,0.03)',
            color: active ? accent : 'var(--text-dim)',
            cursor: 'pointer',
            transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: active ? `0 4px 16px ${accent}22` : 'none'
        }}
    >
        {children}
    </button>
);

// ─── Main component ────────────────────────────────────────────────────────────
const TasksView = () => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const { items, setItems, toggleTask, openModal, profile, subTheme, toggleTrackerDate } = useApp();
    const tasks = items.filter(item => item.type === 'task');
    const habits = items.filter(item => item.type === 'tracker' || item.type === 'time');
    const isHuman = subTheme === 'human';

    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('tasks'); // 'tasks' | 'habit-heatmaps' | 'task-heatmaps'

    const yearDays = useMemo(() => getYearDays(), []);

    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;
    const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

    const filteredTasks = useMemo(() => {
        let list = [...tasks];
        if (filter === 'active') list = list.filter(t => !t.completed);
        if (filter === 'done') list = list.filter(t => t.completed);
        if (search.trim()) list = list.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));
        return list;
    }, [tasks, filter, search]);

    const statsCards = [
        { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: '#10B981', bg: 'rgba(16,185,129,0.1)', sub: `${completed} done today` },
        { label: 'Pending Tasks', value: pending, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', sub: 'needs your focus' },
        { label: 'Completed', value: completed, icon: CheckCircle2, color: '#06B6D4', bg: 'rgba(6,182,212,0.1)', sub: 'great progress!' },
    ];

    return (
        <div className="view active" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>
            <SEO
                title="Tasks & Organization"
                description="Manage your tasks, stay organized, and achieve your goals with LifeFlow's intelligent task management system."
                keywords="task manager, to-do list, task tracker, productivity tool"
            />
            <style>{`
                .tasks-stat-card {
                    padding: 1.5rem;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 1.2rem;
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    cursor: default;
                    position: relative;
                    overflow: hidden;
                }
                .tasks-stat-card::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.04), transparent);
                    pointer-events: none;
                }
                .tasks-stat-card:hover {
                    transform: translateY(-4px) scale(1.01);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                }
                .tasks-filter-btn {
                    padding: 0.5rem 1.2rem;
                    border-radius: 100px;
                    font-size: 0.82rem;
                    font-weight: 800;
                    border: 1px solid transparent;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .tasks-filter-btn.active-filter {
                    background: rgba(6, 182, 212, 0.15);
                    border-color: rgba(6, 182, 212, 0.4);
                    color: var(--primary);
                    box-shadow: 0 4px 16px rgba(6, 182, 212, 0.2);
                }
                .tasks-filter-btn:not(.active-filter) {
                    background: rgba(255,255,255,0.03);
                    border-color: var(--ui-border-soft);
                    color: var(--text-dim);
                }
                .tasks-filter-btn:not(.active-filter):hover {
                    background: rgba(255,255,255,0.06);
                    color: var(--text-main);
                    transform: scale(1.05);
                }
                .heatmap-section-title {
                    font-size: 1.1rem;
                    font-weight: 950;
                    letter-spacing: -0.02em;
                    margin-bottom: 1.2rem;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                .heatmap-card {
                    padding: 1.4rem;
                    border-radius: 22px;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    position: relative;
                    overflow: hidden;
                    transition: box-shadow 0.3s ease;
                }
                .heatmap-card:hover {
                    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
                }
            `}</style>

            {/* ── Header ── */}
            <div className="section-header" style={{
                display: 'flex', flexDirection: 'column', gap: '1.5rem',
                borderBottom: '1px solid var(--ui-border-soft)',
                paddingBottom: '1.8rem', marginBottom: '2.5rem'
            }}>
                <div className="reveal-down" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: 'var(--mobile-h2, 2.5rem)', fontWeight: 950, letterSpacing: '-0.04em' }}>
                            {getGreeting()}, <span className={isHuman ? '' : 'gradient-text text-shimmer'} style={isHuman ? { color: 'var(--primary)' } : {}}>{profile.name}.</span>
                        </h2>
                        <p className="float-up-in stagger-2" style={{ color: 'var(--text-dim)', fontSize: '1rem', marginTop: '0.5rem' }}>
                            {isHuman ? "✅ Let's knock out today's list!" : 'Execute your task queue with precision.'}
                        </p>
                    </div>
                    <button
                        className="btn btn-primary ripple-host float-up-in stagger-3"
                        onClick={() => openModal('task')}
                        style={{ borderRadius: '16px', padding: '0.8rem 1.6rem', fontSize: '0.95rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Plus size={18} />
                        <span>{isHuman ? '📝 Add Task' : 'Add Task'}</span>
                    </button>
                </div>
            </div>

            {/* ── View Mode Tabs ── */}
            <div className="pop-in stagger-3" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1.5px solid var(--ui-border-soft)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
                <TabBtn active={viewMode === 'tasks'} onClick={() => setViewMode('tasks')} accent="var(--primary)">
                    📋 Task List
                </TabBtn>
                <TabBtn active={viewMode === 'habit-heatmaps'} onClick={() => setViewMode('habit-heatmaps')} accent="#10B981">
                    🔥 Habit Heatmaps
                </TabBtn>
                <TabBtn active={viewMode === 'task-heatmaps'} onClick={() => setViewMode('task-heatmaps')} accent="#06B6D4">
                    ✅ Task Heatmaps
                </TabBtn>
            </div>

            {/* ══════════════════════════════════════
                TAB 1 — TASK LIST
            ══════════════════════════════════════ */}
            {viewMode === 'tasks' && (
                <>
                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
                        {statsCards.map((s, i) => (
                            <div key={i} className={`tasks-stat-card glass-premium pop-in stagger-${i + 1}`}
                                style={{ border: `1px solid color-mix(in srgb, ${s.color} 20%, transparent)`, background: `linear-gradient(135deg, ${s.bg}, rgba(255,255,255,0.02))` }}
                            >
                                <div style={{
                                    width: '50px', height: '50px', borderRadius: '15px',
                                    background: s.bg, color: s.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 8px 24px ${s.color}25`, flexShrink: 0
                                }}>
                                    <s.icon size={22} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-main)', lineHeight: 1.1, marginTop: '2px' }}>{s.value}</div>
                                    <div style={{ fontSize: '0.7rem', color: s.color, fontWeight: 700, marginTop: '3px' }}>{s.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress bar */}
                    {tasks.length > 0 && (
                        <div className="pop-in stagger-4" style={{ marginBottom: '2rem', padding: '1.2rem 1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--ui-border-soft)', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-dim)' }}>Daily Progress</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)' }}>{completionRate}%</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                                <div style={{ width: `${completionRate}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '100px', boxShadow: '0 0 12px var(--primary-glow)', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                            </div>
                        </div>
                    )}

                    {/* Filter & Search */}
                    <div className="pop-in stagger-5" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ position: 'relative', flex: '1 1 200px' }}>
                            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.7rem 1rem 0.7rem 2.6rem',
                                    borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--ui-border-soft)', color: 'var(--text-main)',
                                    fontSize: '0.88rem', outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['all', 'active', 'done'].map(f => (
                                <button key={f} className={`tasks-filter-btn ${filter === f ? 'active-filter' : ''}`} onClick={() => setFilter(f)}>
                                    {f === 'all' ? '✦ All' : f === 'active' ? '⏳ Active' : '✅ Done'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Task list */}
                    <div style={{ display: 'grid', gap: '0.9rem' }}>
                        {filteredTasks.length === 0 ? (
                            <div className="glass-premium pop-in" style={{ textAlign: 'center', padding: '5rem 2rem', borderRadius: '28px' }}>
                                <div className="empty-icon-float" style={{ width: '80px', height: '80px', background: 'rgba(6,182,212,0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 0 40px rgba(6,182,212,0.2)' }}>
                                    <CheckCircle2 size={40} color="var(--primary)" />
                                </div>
                                <h3 style={{ fontSize: '1.6rem', fontWeight: 950, marginBottom: '0.8rem' }}>
                                    {search || filter !== 'all' ? 'No matching tasks.' : isHuman ? '🎉 All caught up!' : 'No Tasks Yet.'}
                                </h3>
                                <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                    {search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Plan your day and start crushing it.'}
                                </p>
                                {!search && filter === 'all' && (
                                    <button className="btn btn-primary ripple-host" onClick={() => openModal('task')} style={{ padding: '0.9rem 2.5rem', borderRadius: '100px', fontWeight: 950 }}>Create First Task</button>
                                )}
                            </div>
                        ) : (
                            filteredTasks.map((task, idx) => (
                                <div key={task.id} className={`pop-in stagger-${Math.min(idx + 1, 8)}`}>
                                    <TaskNode
                                        item={task}
                                        onToggle={() => toggleTask(task.id)}
                                        onDelete={(id) => setItems(prev => prev.filter(i => i.id !== id))}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* ══════════════════════════════════════
                TAB 2 — HABIT HEATMAPS (tracker/time)
            ══════════════════════════════════════ */}
            {viewMode === 'habit-heatmaps' && (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="heatmap-section-title" style={{ color: '#10B981' }}>
                        🔥 Habit Contribution Grid
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginLeft: '0.4rem' }}>last 12 months</span>
                    </div>

                    {habits.length === 0 ? (
                        <div className="glass-premium pop-in" style={{ textAlign: 'center', padding: '5rem 2rem', borderRadius: '28px' }}>
                            <Flame size={40} color="#10B981" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 950, marginBottom: '0.8rem' }}>No Habits Yet.</h3>
                            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Create habits in the Habits tab to see your contribution grids here.</p>
                        </div>
                    ) : (
                        habits.map((item, idx) => {
                            const CategoryIcon = categoryIcons[item.category?.toLowerCase()] || categoryIcons.other;
                            const todayStr = getTodayStr();
                            const valToday = (item.history || {})[todayStr] || 0;
                            const totalCompletions = Object.values(item.history || {}).filter(v => v >= item.target).length;

                            return (
                                <div key={item.id} className={`heatmap-card glass-premium pop-in stagger-${Math.min(idx + 1, 8)}`}
                                    style={{ border: `1px solid ${item.color}30`, background: `linear-gradient(135deg, ${item.color}06, rgba(255,255,255,0.015))` }}
                                >
                                    {/* Accent bar */}
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${item.color}, transparent)` }} />

                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${item.color}18`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <CategoryIcon size={18} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>{item.name}</h4>
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2px' }}>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 800 }}>🔥 {item.streak || 0} day streak</span>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>✅ {totalCompletions} total days</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1rem', fontWeight: 900, color: item.color }}>{valToday} / {item.target}</div>
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>TODAY</div>
                                        </div>
                                    </div>

                                    {/* Grid */}
                                    <HeatmapGrid
                                        days={yearDays}
                                        accentColor={item.color}
                                        getColor={({ dateStr }) => {
                                            const val = (item.history || {})[dateStr] || 0;
                                            if (val >= item.target) return item.color;
                                            if (val > 0) return `color-mix(in srgb, ${item.color} 38%, rgba(255,255,255,0.05))`;
                                            return 'rgba(255,255,255,0.05)';
                                        }}
                                        getGlow={({ dateStr }) => {
                                            const val = (item.history || {})[dateStr] || 0;
                                            return val >= item.target ? `0 0 5px ${item.color}55` : 'none';
                                        }}
                                        getTitle={({ date, dateStr }) => {
                                            const val = (item.history || {})[dateStr] || 0;
                                            return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}: ${val}/${item.target}`;
                                        }}
                                        onCellClick={({ dateStr }) => toggleTrackerDate(item.id, dateStr)}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════
                TAB 3 — TASK HEATMAPS (task items)
            ══════════════════════════════════════ */}
            {viewMode === 'task-heatmaps' && (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="heatmap-section-title" style={{ color: '#06B6D4' }}>
                        ✅ Task Completion Grid
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginLeft: '0.4rem' }}>last 12 months</span>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="glass-premium pop-in" style={{ textAlign: 'center', padding: '5rem 2rem', borderRadius: '28px' }}>
                            <ListChecks size={40} color="#06B6D4" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 950, marginBottom: '0.8rem' }}>No Tasks Yet.</h3>
                            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Create tasks and complete them to build your task heatmap.</p>
                            <button className="btn btn-primary ripple-host" onClick={() => openModal('task')} style={{ padding: '0.9rem 2.5rem', borderRadius: '100px', fontWeight: 950 }}>Add First Task</button>
                        </div>
                    ) : (
                        tasks.map((item, idx) => {
                            const taskHistory = item.taskHistory || {};
                            const totalDone = Object.values(taskHistory).filter(v => v >= 1).length;
                            const CYAN = '#06B6D4';

                            return (
                                <div key={item.id} className={`heatmap-card glass-premium pop-in stagger-${Math.min(idx + 1, 8)}`}
                                    style={{ border: `1px solid ${CYAN}28`, background: `linear-gradient(135deg, ${CYAN}05, rgba(255,255,255,0.012))` }}
                                >
                                    {/* Accent bar */}
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${CYAN}, transparent)` }} />

                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${CYAN}18`, color: CYAN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <CheckCircle2 size={18} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>{item.name}</h4>
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2px' }}>
                                                    <span style={{ fontSize: '0.65rem', color: item.completed ? '#10B981' : 'var(--text-muted)', fontWeight: 800 }}>
                                                        {item.completed ? '✅ Done today' : '⏳ Pending today'}
                                                    </span>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                                        📅 {totalDone} day{totalDone !== 1 ? 's' : ''} completed
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                            {item.category && (
                                                <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                                                    {item.category}
                                                </span>
                                            )}
                                            {item.priority && (
                                                <span style={{
                                                    fontSize: '0.6rem', fontWeight: 900, padding: '2px 8px', borderRadius: '100px',
                                                    background: item.priority === 'high' ? 'rgba(239,68,68,0.15)' : item.priority === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(107,114,128,0.15)',
                                                    color: item.priority === 'high' ? '#EF4444' : item.priority === 'medium' ? '#F59E0B' : '#6B7280'
                                                }}>
                                                    {item.priority?.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Grid */}
                                    <HeatmapGrid
                                        days={yearDays}
                                        accentColor={CYAN}
                                        getColor={({ dateStr }) => {
                                            const val = taskHistory[dateStr] || 0;
                                            return val >= 1 ? CYAN : 'rgba(255,255,255,0.05)';
                                        }}
                                        getGlow={({ dateStr }) => {
                                            const val = taskHistory[dateStr] || 0;
                                            return val >= 1 ? `0 0 6px ${CYAN}55` : 'none';
                                        }}
                                        getTitle={({ date, dateStr }) => {
                                            const val = taskHistory[dateStr] || 0;
                                            return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}: ${val >= 1 ? 'Completed ✅' : 'Not completed'}`;
                                        }}
                                        onCellClick={null}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default TasksView;
