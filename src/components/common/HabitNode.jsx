import React, { useState, useRef } from 'react';
import { Trash2, Plus, Minus, Flame, Check } from 'lucide-react';
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

/* ---------- tiny SVG ring progress ---------- */
const RingProgress = ({ pct, color, size = 52, stroke = 4, isHuman }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color + (isHuman ? '12' : '20')} strokeWidth={stroke} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ 
                    transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)', 
                    filter: isHuman ? 'none' : `drop-shadow(0 0 4px ${color})` 
                }}
            />
        </svg>
    );
};

/* ---------- spark burst on log ---------- */
const Sparks = ({ color, active, isHuman }) => {
    if (!active) return null;
    const sparks = Array.from({ length: 8 }, (_, i) => i);
    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
            {sparks.map(i => {
                const angle = (i / 8) * 360;
                if (isHuman) {
                    const symbols = ['⭐', '✨', '❤️', '🌸', '✏️', '☀️', '🎉', '🍀'];
                    const symbol = symbols[i % symbols.length];
                    return (
                        <div key={i} style={{
                            position: 'absolute',
                            bottom: '50%', left: '50%',
                            fontSize: '14px',
                            transformOrigin: '0 0',
                            animation: `spark-burst-${i % 4} 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
                            transform: `rotate(${angle}deg) translateY(-28px)`,
                            opacity: 1
                        }}>
                            {symbol}
                        </div>
                    );
                }
                return (
                    <div key={i} style={{
                        position: 'absolute',
                        bottom: '50%', left: '50%',
                        width: '5px', height: '5px',
                        borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 6px ${color}`,
                        transformOrigin: '0 0',
                        animation: `spark-burst-${i % 4} 0.5s ease-out forwards`,
                        transform: `rotate(${angle}deg) translateY(-28px)`,
                    }} />
                );
            })}
        </div>
    );
};

const HabitNode = ({ item, onUpdateValue, onDelete }) => {
    const { subTheme, toggleTrackerDate } = useApp();
    const isHuman = subTheme === 'human';
    const progress = Math.min(100, (item.value / item.target) * 100);
    const allIcons = { ...categoryIcons, ...premiumIcons };
    const CategoryIcon = allIcons[item.category?.toLowerCase()] || allIcons.other;
    const [justLogged, setJustLogged] = useState(false);
    const [sparking, setSparking] = useState(false);
    const [isSquished, setIsSquished] = useState(false);
    const [historyTab, setHistoryTab] = useState('week');
    const cardRef = useRef(null);

    const handleLog = () => {
        onUpdateValue(item.id, 1);
        setJustLogged(true);
        setSparking(true);
        setIsSquished(true);
        setTimeout(() => setJustLogged(false), 500);
        setTimeout(() => setSparking(false), 600);
        setTimeout(() => setIsSquished(false), 550);
    };

    // 3-D magnetic tilt (disabled in human theme)
    const handleMouseMove = (e) => {
        if (isHuman) return;
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) scale(1.015)`;
    };
    const handleMouseLeave = (e) => {
        const card = cardRef.current;
        if (!card) return;
        if (isHuman) {
            card.style.transform = 'translateY(0) rotate(0deg)';
            card.style.boxShadow = '6px 8px 1px rgba(0, 0, 0, 0.05)';
            return;
        }
        card.style.transform = 'translateY(0) rotateX(0) rotateY(0) scale(1)';
        card.style.boxShadow = '';
        card.style.borderColor = item.completed ? item.color + '60' : 'var(--glass-border)';
    };
    const handleMouseEnter = (e) => {
        const card = cardRef.current;
        if (!card) return;
        if (isHuman) {
            card.style.transform = 'translateY(-4px) rotate(-0.5deg)';
            card.style.boxShadow = '8px 10px 2px rgba(0,0,0,0.06)';
            return;
        }
        card.style.boxShadow = `0 24px 48px rgba(0,0,0,0.35), 0 0 32px ${item.color}30`;
        card.style.borderColor = item.color + '55';
    };

    const cleanId = String(item.id).replace(/[^a-zA-Z0-9]/g, '');

    return (
        <>
            <style>{`
                @keyframes spark-burst-0 { to { transform: rotate(var(--a)) translateY(-38px) scale(0); opacity:0; } }
                @keyframes spark-burst-1 { 50%{ opacity:1; } to { transform: rotate(var(--a)) translateY(-40px) scale(0); opacity:0; } }
                @keyframes spark-burst-2 { to { transform: rotate(var(--a)) translateY(-35px) scale(0); opacity:0; } }
                @keyframes spark-burst-3 { 60%{ opacity:1; } to { transform: rotate(var(--a)) translateY(-42px) scale(0); opacity:0; } }
                @keyframes habit-log-flash { 0%{opacity:0.7;} 100%{opacity:0;} }
                @keyframes habit-complete-ring { 0%{transform:scale(0.8);opacity:1;} 100%{transform:scale(1.6);opacity:0;} }
                .habit-log-btn {
                    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
                }
                .habit-log-btn:hover {
                    filter: brightness(1.15);
                    transform: scale(1.04);
                }
                .habit-log-btn:active { transform: scale(0.94); }
                .habit-minus-btn:hover { border-color: var(--danger) !important; color: var(--danger) !important; }
                
                /* Custom overrides to preserve dynamic category colors under human theme */
                .human-theme .habit-node-${cleanId} .habit-log-btn {
                    background: ${item.completed ? 'var(--secondary)' : item.color} !important;
                    border-color: var(--text-main) !important;
                    color: white !important;
                    box-shadow: 3px 3px 0px var(--text-main) !important;
                    transform: translate(-1px, -1px);
                }
                .human-theme .habit-node-${cleanId} .habit-log-btn:hover {
                    background: ${item.completed ? 'var(--secondary)' : item.color}dd !important;
                    transform: translate(1px, 1px) !important;
                    box-shadow: 1px 1px 0px var(--text-main) !important;
                }
                .human-theme .habit-node-${cleanId} .habit-minus-btn {
                    border-color: var(--glass-border) !important;
                    color: var(--text-muted) !important;
                    background: var(--bg-card) !important;
                    box-shadow: 2px 2px 0px var(--glass-border) !important;
                }
                .human-theme .habit-node-${cleanId} .habit-minus-btn:hover {
                    border-color: var(--danger) !important;
                    color: var(--danger) !important;
                    box-shadow: 1px 1px 0px var(--danger) !important;
                }
            `}</style>

            <div
                ref={cardRef}
                className={`card-scan habit-card habit-node-${cleanId} ${isSquished ? 'squish-bounce-active' : ''}`}
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: isHuman ? '255px 15px 225px 15px/15px 225px 15px 255px' : '22px',
                    border: isHuman 
                        ? `2.5px ${item.completed ? 'solid' : 'dashed'} ${item.completed ? item.color : 'var(--glass-border)'}` 
                        : `1px solid ${item.completed ? item.color + '55' : 'rgba(255,255,255,0.08)'}`,
                    background: isHuman 
                        ? (item.completed ? `color-mix(in srgb, ${item.color} 8%, var(--bg-card))` : 'var(--bg-card)')
                        : (item.completed 
                            ? `linear-gradient(135deg, ${item.color}12, ${item.color}06)`
                            : 'linear-gradient(135deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))'),
                    backdropFilter: isHuman ? 'none' : 'blur(24px)',
                    transition: 'transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.35s ease, border-color 0.35s ease',
                    padding: '1.4rem',
                    perspective: '800px',
                    transformStyle: 'preserve-3d',
                    boxShadow: isHuman ? '6px 8px 1px rgba(0, 0, 0, 0.05)' : ''
                }}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Hand-drawn tape/paper decorations */}
                {isHuman && <div className="paperclip-overlay" />}
                {isHuman && (
                    <div style={{
                        position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%) rotate(-1.5deg)',
                        width: '62px', height: '18px',
                        background: 'rgba(202, 138, 4, 0.22)',
                        border: '1.5px solid rgba(202, 138, 4, 0.32)',
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

                {/* Top colour stripe */}
                {!isHuman && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                        background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
                        opacity: item.completed ? 1 : 0.45,
                        transition: 'opacity 0.4s'
                    }} />
                )}

                {/* Corner glow blob */}
                {!isHuman && (
                    <div style={{
                        position: 'absolute', top: '-30px', right: '-30px',
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: item.color,
                        opacity: item.completed ? 0.08 : 0.04,
                        filter: 'blur(30px)',
                        pointerEvents: 'none',
                        transition: 'opacity 0.4s'
                    }} />
                )}

                {/* Spark burst overlay */}
                <Sparks color={item.color} active={sparking} isHuman={isHuman} />

                {/* Flash on log */}
                {justLogged && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: `${item.color}25`,
                        borderRadius: isHuman ? '255px 15px 225px 15px/15px 225px 15px 255px' : '22px',
                        animation: 'habit-log-flash 0.45s ease-out forwards',
                        pointerEvents: 'none', zIndex: 5
                    }} />
                )}

                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.1rem', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
                        {/* Icon with ring progress */}
                        <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0 }}>
                            <RingProgress pct={progress} color={item.color} size={52} stroke={3} isHuman={isHuman} />
                            <div style={{
                                position: 'absolute', inset: '6px',
                                borderRadius: '50%',
                                background: `${item.color}18`,
                                color: item.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                boxShadow: (item.completed && !isHuman) ? `0 0 16px ${item.color}50` : 'none'
                            }}>
                                <CategoryIcon size={20} />
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '3px', lineHeight: 1.2 }}>
                                {item.name}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Flame size={13} color="#F59E0B" style={isHuman ? {} : { filter: 'drop-shadow(0 0 4px #F59E0B88)' }} />
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)' }}>
                                    {item.streak || 0} day streak
                                </span>
                                {item.completed && (
                                    <span style={{
                                        marginLeft: '4px', fontSize: '0.6rem', fontWeight: 900,
                                        background: `${item.color}22`, color: item.color,
                                        padding: '1px 7px', borderRadius: '20px',
                                        border: `1px solid ${item.color}35`,
                                        letterSpacing: '0.05em'
                                    }}>✓ DONE</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => onDelete(item.id)} className="btn-icon-dim" style={{ marginTop: '-2px' }}>
                        <Trash2 size={13} />
                    </button>
                </div>

                {/* Progress section */}
                <div style={{ marginBottom: '1.1rem', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Progress
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: item.color }}>
                            {item.value}
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>
                                {' '}/ {item.target} {item.unit || 'times'}
                            </span>
                        </span>
                    </div>

                    {/* Bar */}
                    <div style={{ 
                        height: isHuman ? '8px' : '6px', 
                        background: isHuman ? 'var(--ui-bg-low)' : 'rgba(255,255,255,0.05)', 
                        borderRadius: '10px', 
                        overflow: 'hidden', 
                        position: 'relative',
                        border: isHuman ? '1.5px solid var(--glass-border)' : 'none'
                    }}>
                        <div style={{
                            width: `${progress}%`,
                            background: isHuman ? item.color : `linear-gradient(90deg, ${item.color}88, ${item.color})`,
                            height: '100%',
                            transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                            boxShadow: isHuman ? 'none' : `0 0 10px ${item.color}70`,
                            borderRadius: '10px',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            {!isHuman && (
                                <div style={{
                                    position: 'absolute', top: 0, left: '-60%', width: '60%', height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                                    animation: 'progress-shimmer 2s infinite linear'
                                }} />
                            )}
                        </div>
                        {/* glowing tip */}
                        {!isHuman && progress > 0 && progress < 100 && (
                            <div style={{
                                position: 'absolute', top: '-2px', bottom: '-2px',
                                left: `calc(${progress}% - 4px)`,
                                width: '8px', borderRadius: '50%',
                                background: item.color,
                                boxShadow: `0 0 8px ${item.color}`,
                                transition: 'left 0.8s cubic-bezier(0.34,1.56,0.64,1)'
                             }} />
                        )}
                    </div>
                    <p style={{ marginTop: '4px', fontSize: '0.65rem', color: isHuman ? 'var(--text-muted)' : item.color, fontWeight: 900, textAlign: 'right' }}>
                        {progress.toFixed(0)}%
                    </p>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.6rem', position: 'relative', zIndex: 2 }}>
                    <button
                        onClick={() => onUpdateValue(item.id, -1)}
                        className="habit-minus-btn btn btn-glass ripple-host"
                        style={{ width: '44px', height: '40px', padding: 0, borderRadius: '12px', flexShrink: 0, color: 'var(--text-muted)', fontSize: '1.2rem', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.25s ease' }}
                    >
                        <Minus size={16} />
                    </button>
                    <button
                        onClick={handleLog}
                        className="btn habit-log-btn ripple-host"
                        style={{
                            flex: 1, height: '40px', borderRadius: '12px',
                            background: item.completed
                                ? `linear-gradient(135deg, ${item.color}cc, ${item.color})`
                                : `linear-gradient(135deg, ${item.color}99, ${item.color})`,
                            border: 'none', color: 'white',
                            boxShadow: justLogged ? `0 0 28px ${item.color}80` : `0 4px 14px ${item.color}35`,
                            fontWeight: 800, fontSize: '0.85rem',
                            gap: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        {item.completed
                            ? <><Check size={15} strokeWidth={3} /> Logged</>
                            : <><Plus size={15} strokeWidth={3} /> Log Activity</>
                        }
                    </button>
                </div>

                {/* ── Inline Habit Tracker: Week / Month / Year ── */}
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
                                        title={`${day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${val}/${item.target}`}
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
                                            title={`${day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${val}/${item.target}`}
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
                                            title={`${dayObj.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}: ${val}/${item.target}`}
                                            style={{
                                                width: '9px', height: '9px', borderRadius: '1.5px',
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

                {!isHuman && (
                    <style>{`
                        @keyframes progress-shimmer { 0%{left:-60%;} 100%{left:150%;} }
                    `}</style>
                )}
            </div>
        </>
    );
};

export default HabitNode;
