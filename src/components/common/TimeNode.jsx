import React, { useState, useEffect } from 'react';
import { Trash2, Play, Pause, RotateCcw, Flame, Settings2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { categoryIcons, premiumIcons } from '../../utils/constants';
import { useApp } from '../../context/AppContext';

const getTodayStr = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
};

const formatDateStr = (d) => {
    if (!d) return '';
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
};

const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const diff = today.getDay() === 0 ? -6 : 1 - today.getDay();
    startOfWeek.setDate(today.getDate() + diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push(d);
    }
    return days;
};

const getMonthDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days = [];
    for (let i = 0; i < startPadding; i++) {
        days.push(null);
    }
    
    const totalDays = lastDay.getDate();
    for (let i = 1; i <= totalDays; i++) {
        days.push(new Date(year, month, i));
    }
    return days;
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

const TimeNode = ({ item, onUpdateValue, onDelete }) => {
    const { subTheme, toggleTrackerDate } = useApp();
    const isHuman = subTheme === 'human';

    const [isRunning, setIsRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [showManual, setShowManual] = useState(false);
    const [manualMins, setManualMins] = useState(item.target || 30);
    const [isSquished, setIsSquished] = useState(false);
    const [historyTab, setHistoryTab] = useState('week');

    const allIcons = { ...categoryIcons, ...premiumIcons };
    const CategoryIcon = allIcons[item.category?.toLowerCase()] || allIcons.other;

    const triggerSquish = () => {
        setIsSquished(true);
        setTimeout(() => setIsSquished(false), 550);
    };

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const handleSaveSession = () => {
        const minutes = Math.floor(seconds / 60);
        triggerSquish();
        if (minutes > 0) {
            onUpdateValue(item.id, minutes);
            setSeconds(0);
            setIsRunning(false);
            confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 }, colors: [item.color, '#ffffff'] });
        } else if (seconds > 0) {
            onUpdateValue(item.id, 1);
            setSeconds(0);
            setIsRunning(false);
        }
    };

    const handleManualLog = () => {
        triggerSquish();
        onUpdateValue(item.id, Number(manualMins));
        setShowManual(false);
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 }, colors: [item.color, '#ffffff'] });
    };

    const formatDisplayTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = Math.min(100, (item.value / item.target) * 100);
    const cleanId = String(item.id).replace(/[^a-zA-Z0-9]/g, '');

    return (
        <div className={`glass-premium p-6 habit-node time-node card-hover-elite timer-card time-node-${cleanId} ${isSquished ? 'squish-bounce-active' : ''}`} style={{
            position: 'relative',
            borderRadius: isHuman ? '255px 15px 225px 15px/15px 225px 15px 255px' : '24px',
            border: isHuman 
                ? `2.5px ${item.completed ? 'solid' : 'dashed'} ${item.completed ? item.color : 'var(--glass-border)'}` 
                : `1px solid ${item.completed ? item.color : 'var(--glass-border)'}`,
            background: isHuman 
                ? (item.completed ? `color-mix(in srgb, ${item.color} 8%, var(--bg-card))` : 'var(--bg-card)')
                : (item.completed ? `${item.color}08` : 'var(--bg-card)'),
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: isHuman ? '6px 8px 1px rgba(0, 0, 0, 0.05)' : ''
        }}>
            <style>{`
                /* Custom styles to protect dynamically colored category elements in human mode */
                .human-theme .time-node-${cleanId} .btn-play-pause {
                    background: ${isRunning ? 'rgba(239, 68, 68, 0.1)' : `${item.color}12`} !important;
                    color: ${isRunning ? 'var(--danger)' : item.color} !important;
                    border-color: ${isRunning ? 'var(--danger)' : 'var(--glass-border)'} !important;
                    box-shadow: 2px 2px 0px ${isRunning ? 'var(--danger)' : 'var(--glass-border)'} !important;
                    transform: translate(-1px, -1px);
                }
                .human-theme .time-node-${cleanId} .btn-play-pause:hover {
                    background: ${isRunning ? 'rgba(239, 68, 68, 0.18)' : `${item.color}20`} !important;
                    transform: translate(1px, 1px) !important;
                    box-shadow: 1px 1px 0px ${isRunning ? 'var(--danger)' : 'var(--glass-border)'} !important;
                }
                .human-theme .time-node-${cleanId} .btn-sync {
                    background: ${item.color} !important;
                    color: white !important;
                    border-color: var(--text-main) !important;
                    box-shadow: 3px 3px 0px var(--text-main) !important;
                    transform: translate(-1px, -1px);
                }
                .human-theme .time-node-${cleanId} .btn-sync:hover {
                    background: ${item.color}dd !important;
                    transform: translate(1px, 1px) !important;
                    box-shadow: 1px 1px 0px var(--text-main) !important;
                }
                .human-theme .time-node-${cleanId} .btn-reset {
                    background: var(--bg-card) !important;
                    color: var(--text-muted) !important;
                    border-color: var(--glass-border) !important;
                    box-shadow: 2px 2px 0px var(--glass-border) !important;
                }
                .human-theme .time-node-${cleanId} .btn-reset:hover {
                    color: var(--text-main) !important;
                    box-shadow: 1px 1px 0px var(--glass-border) !important;
                }
            `}</style>

            {/* Hand-drawn tape/paper decorations */}
            {isHuman && <div className="paperclip-overlay" />}
            {isHuman && (
                <div style={{
                    position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%) rotate(1deg)',
                    width: '60px', height: '18px',
                    background: 'rgba(202, 138, 4, 0.25)',
                    border: '1.5px solid rgba(202, 138, 4, 0.35)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    borderRadius: '2px',
                    zIndex: 10,
                    pointerEvents: 'none'
                }} />
            )}

            {/* Ink stamp overlay in human mode */}
            {isHuman && item.completed && (
                <div className="ink-stamp-overlay">DONE</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: isRunning ? `${item.color}30` : `${item.color}15`,
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${item.color}30`,
                        animation: isRunning ? 'pulse-slow 2s infinite' : 'none'
                    }}>
                        <CategoryIcon size={22} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.2rem' }}>{item.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                                onClick={() => setShowManual(!showManual)}
                                style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    color: showManual ? item.color : 'var(--text-dim)',
                                    background: showManual ? `${item.color}15` : 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    padding: '3px 10px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <Settings2 size={10} /> {showManual ? 'SYNC TIMER' : 'MANUAL MODE'}
                            </button>
                        </div>
                    </div>
                </div>
                <button onClick={() => onDelete(item.id)} className="btn-icon-dim">
                    <Trash2 size={14} />
                </button>
            </div>

            {showManual ? (
                <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease-out', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SELECT SESSION</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 950, color: item.color }}>{manualMins}m</span>
                    </div>
                    <input
                        type="range" min="5" max="180" step="5" value={manualMins}
                        onChange={(e) => setManualMins(e.target.value)}
                        style={{ width: '100%', accentColor: item.color, cursor: 'pointer', height: '6px', borderRadius: '10px', background: 'var(--ui-bg-low)', WebkitAppearance: 'none' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem' }}>
                        {[15, 30, 60, 120].map(m => (
                            <button key={m} onClick={() => setManualMins(m)} style={{
                                background: manualMins == m ? `${item.color}20` : 'transparent',
                                border: `1px solid ${manualMins == m ? item.color : 'transparent'}`,
                                color: manualMins == m ? item.color : 'var(--text-dim)',
                                fontSize: '0.65rem', fontWeight: 950, padding: '4px 10px', borderRadius: '8px', cursor: 'pointer'
                            }}>
                                {m}m
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ marginBottom: '1.5rem', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)' }}>
                        {formatDisplayTime(seconds)}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.2rem', marginBottom: '1rem' }}>Current Session Pulse</p>

                    <div className="session-timeline" style={{ 
                        height: '6px', 
                        background: 'var(--ui-bg-low)', 
                        borderRadius: '10px', 
                        overflow: 'hidden', 
                        position: 'relative',
                        border: isHuman ? '1.5px solid var(--glass-border)' : 'none'
                    }}>
                        <div style={{
                            width: `${Math.min(100, (seconds / (item.target * 60)) * 100)}%`,
                            background: item.color,
                            height: '100%',
                            transition: 'width 1s linear',
                            boxShadow: isHuman ? 'none' : `0 0 10px ${item.color}`
                        }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', padding: '0 2px' }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} style={{ width: '1px', height: '100%', background: isHuman ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)' }} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="habit-stats" style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Lifetime Performance</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 950, color: item.color }}>{item.value} <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>/ {item.target}m</span></span>
                </div>
                <div style={{ 
                    height: '8px', 
                    background: 'var(--ui-bg-low)', 
                    borderRadius: '10px', 
                    overflow: 'hidden',
                    border: isHuman ? '1.5px solid var(--glass-border)' : 'none'
                }}>
                    <div style={{ 
                        width: `${progress}%`, 
                        background: isHuman ? item.color : `linear-gradient(90deg, ${item.color}, ${item.color}cc)`, 
                        height: '100%', 
                        borderRadius: '10px', 
                        transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                    }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', position: 'relative', zIndex: 2 }}>
                {showManual ? (
                    <button
                        onClick={handleManualLog}
                        className="btn btn-primary btn-sync"
                        style={{ flex: 1, height: '44px', borderRadius: '12px', background: item.color, border: 'none', color: 'white', fontWeight: 950, fontSize: '0.9rem' }}
                    >
                        Synchronize {manualMins}m
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => { setIsRunning(!isRunning); triggerSquish(); }}
                            className="btn btn-play-pause"
                            style={{
                                flex: 1,
                                height: '44px',
                                borderRadius: '12px',
                                background: isRunning ? 'rgba(239, 68, 68, 0.15)' : `${item.color}15`,
                                color: isRunning ? 'var(--danger)' : item.color,
                                border: `1px solid ${isRunning ? 'rgba(239, 68, 68, 0.3)' : `${item.color}30`}`
                            }}
                        >
                            {isRunning ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button
                            onClick={handleSaveSession}
                            disabled={seconds === 0}
                            className="btn btn-primary btn-sync"
                            style={{ flex: 2, height: '44px', borderRadius: '12px', background: item.color, border: 'none', color: 'white', fontWeight: 950, opacity: seconds === 0 ? 0.5 : 1 }}
                        >
                            Sync Duration
                        </button>
                        <button
                            onClick={() => { setSeconds(0); setIsRunning(false); }}
                            className="btn btn-glass btn-reset"
                            style={{ padding: '0 12px', borderRadius: '12px' }}
                        >
                            <RotateCcw size={18} />
                        </button>
                    </>
                )}
            </div>

            {/* ── Inline Duration Tracker: Week / Month / Year ── */}
            <div style={{
                marginTop: '1.1rem',
                paddingTop: '1.1rem',
                borderTop: `1px solid ${item.color}22`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                position: 'relative',
                zIndex: 2
            }}>
                {/* Tab strip */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.18)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
                    {[
                        { id: 'week',  label: '📅 Week'  },
                        { id: 'month', label: '🗓 Month'  },
                        { id: 'year',  label: '📊 Year'   },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setHistoryTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '0.38rem 0',
                                fontSize: '0.68rem',
                                fontWeight: 900,
                                border: historyTab === tab.id ? `1px solid ${item.color}40` : '1px solid transparent',
                                background: historyTab === tab.id
                                    ? `color-mix(in srgb, ${item.color} 18%, rgba(0,0,0,0.2))`
                                    : 'transparent',
                                color: historyTab === tab.id ? item.color : 'var(--text-muted)',
                                borderRadius: '7px',
                                cursor: 'pointer',
                                letterSpacing: '0.03em',
                                transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                                boxShadow: historyTab === tab.id ? `0 2px 10px ${item.color}20` : 'none'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── WEEK ── */}
                {historyTab === 'week' && (
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', padding: '0.3rem 0' }}>
                        {getWeekDays().map((day, idx) => {
                            const dStr = formatDateStr(day);
                            const val = (item.history || {})[dStr] || 0;
                            const done = val >= item.target;
                            const partial = val > 0 && val < item.target;
                            const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
                            const isToday = dStr === getTodayStr();

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => toggleTrackerDate(item.id, dStr)}
                                    title={`${day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${val}/${item.target}m`}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                                        background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 2px'
                                    }}
                                >
                                    <span style={{ fontSize: '0.55rem', fontWeight: 900, color: isToday ? item.color : 'var(--text-muted)', letterSpacing: '0.04em' }}>
                                        {dayNames[idx]}
                                    </span>
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        border: `2px solid ${done ? item.color : partial ? `color-mix(in srgb, ${item.color} 50%, transparent)` : isToday ? item.color + '60' : 'rgba(255,255,255,0.1)'}`,
                                        background: done ? item.color : partial ? `${item.color}22` : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: done ? '#fff' : 'var(--text-dim)',
                                        fontSize: '0.62rem', fontWeight: 900,
                                        boxShadow: done ? `0 0 12px ${item.color}55` : isToday ? `0 0 6px ${item.color}30` : 'none',
                                        transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)'
                                    }}>
                                        {done ? '✓' : day.getDate()}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* ── MONTH ── */}
                {historyTab === 'month' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)' }}>
                                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <span style={{ fontSize: '0.6rem', color: item.color, fontWeight: 800 }}>
                                {Object.entries(item.history || {}).filter(([k, v]) => {
                                    const d = new Date(k);
                                    const now = new Date();
                                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && v >= item.target;
                                }).length} / {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} days
                            </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', textAlign: 'center', marginBottom: '4px' }}>
                            {['M','T','W','T','F','S','S'].map((n, i) => (
                                <span key={i} style={{ fontSize: '0.5rem', fontWeight: 900, color: 'var(--text-muted)' }}>{n}</span>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                            {getMonthDays().map((day, idx) => {
                                if (!day) return <div key={idx} />;
                                const dStr = formatDateStr(day);
                                const val = (item.history || {})[dStr] || 0;
                                const done = val >= item.target;
                                const partial = val > 0 && val < item.target;
                                const isToday = dStr === getTodayStr();

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => toggleTrackerDate(item.id, dStr)}
                                        title={`${day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${val}/${item.target}m`}
                                        style={{
                                            aspectRatio: '1', borderRadius: '7px',
                                            border: `1px solid ${done ? item.color : partial ? `${item.color}55` : isToday ? item.color + '50' : 'rgba(255,255,255,0.06)'}`,
                                            background: done ? item.color : partial ? `${item.color}18` : 'rgba(0,0,0,0.08)',
                                            color: done ? '#fff' : 'var(--text-dim)',
                                            fontSize: '0.6rem', fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: done ? `0 0 8px ${item.color}40` : isToday ? `0 0 5px ${item.color}25` : 'none',
                                            transition: 'all 0.18s'
                                        }}
                                    >
                                        {done ? '✓' : day.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── YEAR (GitHub Contribution Grid) ── */}
                {historyTab === 'year' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)' }}>Last 12 months</span>
                            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Less</span>
                                {[0.05, 0.25, 0.5, 0.75, 1].map((o, i) => (
                                    <div key={i} style={{
                                        width: '7px', height: '7px', borderRadius: '1.5px',
                                        background: o < 0.1 ? 'rgba(255,255,255,0.05)' : `color-mix(in srgb, ${item.color} ${Math.round(o * 100)}%, rgba(255,255,255,0.05))`
                                    }} />
                                ))}
                                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>More</span>
                            </div>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateRows: 'repeat(7, 9px)',
                            gridAutoFlow: 'column',
                            gap: '2.5px',
                            overflowX: 'auto',
                            padding: '5px',
                            background: 'rgba(0,0,0,0.15)',
                            borderRadius: '10px',
                            scrollbarWidth: 'none'
                        }}>
                            {getYearDays().map((dayObj, idx) => {
                                if (dayObj.isFuture) return (
                                    <div key={idx} style={{ width: '9px', height: '9px', borderRadius: '1.5px', background: 'transparent' }} />
                                );

                                const val = (item.history || {})[dayObj.dateStr] || 0;
                                const done = val >= item.target;
                                const partial = val > 0 && val < item.target;

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => toggleTrackerDate(item.id, dayObj.dateStr)}
                                        title={`${dayObj.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}: ${val}/${item.target}m`}
                                        style={{
                                            width: '9px',
                                            height: '9px',
                                            borderRadius: '1.5px',
                                            border: 'none',
                                            background: done
                                                ? item.color
                                                : partial
                                                    ? `color-mix(in srgb, ${item.color} 40%, rgba(255,255,255,0.05))`
                                                    : 'rgba(255,255,255,0.05)',
                                            cursor: 'pointer', outline: 'none',
                                            transition: 'transform 0.12s, background-color 0.15s',
                                            boxShadow: done ? `0 0 5px ${item.color}55` : 'none'
                                        }}
                                        onMouseEnter={e => { e.target.style.transform = 'scale(1.6)'; e.target.style.zIndex = '10'; }}
                                        onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.zIndex = '1'; }}
                                    />
                                );
                            })}
                        </div>
                        <span style={{ fontSize: '0.52rem', color: 'var(--text-muted)', textAlign: 'right', fontStyle: 'italic' }}>
                            Click any block to toggle past completions
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeNode;
