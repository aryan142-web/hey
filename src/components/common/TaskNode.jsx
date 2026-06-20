import React, { useState, useRef } from 'react';
import { Trash2, Check, Calendar, Zap } from 'lucide-react';
import { categoryIcons, premiumIcons } from '../../utils/constants';
import { useApp } from '../../context/AppContext';

const TaskNode = ({ item, onToggle, onDelete }) => {
    const { subTheme } = useApp();
    const isHuman = subTheme === 'human';

    const allIcons = { ...categoryIcons, ...premiumIcons };
    const CategoryIcon = allIcons[item.category?.toLowerCase()] || allIcons.other;
    const [justToggled, setJustToggled] = useState(false);
    const [isSquished, setIsSquished] = useState(false);
    const rowRef = useRef(null);

    const handleToggle = () => {
        setJustToggled(true);
        setIsSquished(true);
        onToggle(item.id);
        setTimeout(() => setJustToggled(false), 600);
        setTimeout(() => setIsSquished(false), 550);
    };

    const handleMouseEnter = () => {
        if (rowRef.current) {
            if (isHuman) {
                rowRef.current.style.transform = 'translateY(-2px) rotate(-0.5deg)';
                rowRef.current.style.boxShadow = '6px 8px 1px rgba(0,0,0,0.05)';
                return;
            }
            rowRef.current.style.transform = 'translateX(5px)';
            rowRef.current.style.borderColor = item.color + '45';
            rowRef.current.style.boxShadow = `0 8px 28px rgba(0,0,0,0.18), -3px 0 0 ${item.color}`;
        }
    };

    const handleMouseLeave = () => {
        if (rowRef.current) {
            if (isHuman) {
                rowRef.current.style.transform = 'translateY(0) rotate(0deg)';
                rowRef.current.style.boxShadow = '2px 4px 0px rgba(0,0,0,0.03)';
                return;
            }
            rowRef.current.style.transform = 'translateX(0)';
            rowRef.current.style.borderColor = item.completed ? `${item.color}40` : 'rgba(255,255,255,0.07)';
            rowRef.current.style.boxShadow = 'none';
        }
    };

    const cleanId = String(item.id).replace(/[^a-zA-Z0-9]/g, '');

    return (
        <>
            <style>{`
                @keyframes task-flash { 0%{opacity:0.7;} 100%{opacity:0;} }
                @keyframes check-pop { 0%{transform:scale(0) rotate(-15deg);} 60%{transform:scale(1.25) rotate(5deg);} 100%{transform:scale(1) rotate(0);} }
                @keyframes strike-in { from{width:0;} to{width:100%;} }
                .task-node-wrap {
                    transition: transform 0.3s cubic-bezier(0.16,1,0.3,1),
                                border-color 0.3s ease,
                                box-shadow 0.3s ease,
                                background 0.4s ease;
                }
                .task-check-btn {
                    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
                }
                .task-check-btn:hover {
                    transform: scale(1.18) rotate(5deg);
                }
                .task-check-btn:active { transform: scale(0.88); }
                .task-delete-btn {
                    opacity: 0;
                    transition: opacity 0.2s ease, color 0.2s ease, background 0.2s ease;
                }
                .task-node-wrap:hover .task-delete-btn {
                    opacity: 1;
                }
                .task-category-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-size: 0.62rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    transition: all 0.2s ease;
                }
                
                /* Custom overrides to protect category color settings under human theme */
                .human-theme .task-node-${cleanId} .task-check-btn {
                    background: ${item.completed ? item.color : 'var(--bg-dark)'} !important;
                    border-color: ${item.completed ? item.color : 'var(--glass-border)'} !important;
                    color: white !important;
                    box-shadow: 2px 2px 0px ${item.completed ? 'var(--text-main)' : 'var(--glass-border)'} !important;
                }
                .human-theme .task-node-${cleanId} .task-check-btn:hover {
                    transform: scale(1.15) rotate(4deg) !important;
                }
            `}</style>

            <div
                ref={rowRef}
                className={`task-node-wrap task-card glass task-node-${cleanId} ${isSquished ? 'squish-bounce-active' : ''}`}
                style={{
                    padding: '0.9rem 1rem',
                    borderRadius: isHuman ? '255px 15px 225px 15px/15px 225px 15px 255px' : '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.9rem',
                    border: isHuman 
                        ? `2.5px ${item.completed ? 'solid' : 'dashed'} var(--glass-border)`
                        : (item.completed ? `1px solid ${item.color}40` : '1px solid rgba(255,255,255,0.07)'),
                    background: isHuman
                        ? (item.completed ? 'color-mix(in srgb, var(--primary) 6%, var(--bg-card))' : 'var(--bg-card)')
                        : (item.completed
                            ? `linear-gradient(135deg, ${item.color}08, transparent)`
                            : 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))'),
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isHuman ? '2px 4px 0px rgba(0,0,0,0.03)' : 'none',
                    backdropFilter: isHuman ? 'none' : 'blur(18px)'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Completed stamp overlay in human mode */}
                {isHuman && item.completed && (
                    <div className="ink-stamp-overlay">DONE</div>
                )}

                {/* Completion colour flash */}
                {justToggled && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: `${item.color}20`,
                        borderRadius: isHuman ? '255px 15px 225px 15px/15px 225px 15px 255px' : '18px',
                        animation: 'task-flash 0.5s ease-out forwards',
                        pointerEvents: 'none', zIndex: 0
                    }} />
                )}

                {/* Left accent bar */}
                {!isHuman && (
                    <div style={{
                        position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px',
                        borderRadius: '0 3px 3px 0',
                        background: `linear-gradient(180deg, ${item.color}, ${item.color}66)`,
                        opacity: item.completed ? 1 : 0.35,
                        boxShadow: `2px 0 8px ${item.color}40`,
                        transition: 'opacity 0.3s ease'
                    }} />
                )}

                {/* Checkpoint button */}
                <button
                    onClick={handleToggle}
                    className={`task-check-btn ${item.completed ? 'check-bounce-active' : ''}`}
                    style={{
                        width: '34px', height: '34px', borderRadius: '10px',
                        border: `2px solid ${item.completed ? item.color : 'rgba(255,255,255,0.15)'}`,
                        background: item.completed
                            ? `linear-gradient(135deg, ${item.color}cc, ${item.color})`
                            : 'rgba(255,255,255,0.03)',
                        color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0, zIndex: 2,
                        boxShadow: (item.completed && !isHuman) ? `0 0 14px ${item.color}60` : 'none',
                    }}
                >
                    {item.completed && (
                        <Check size={16} strokeWidth={3} style={{ animation: 'check-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }} />
                    )}
                </button>

                {/* Task info */}
                <div style={{ flex: 1, zIndex: 1, minWidth: 0, opacity: item.completed ? 0.6 : 1, transition: 'opacity 0.3s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '3px' }}>
                        {/* Category icon badge */}
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            background: `${item.color}18`, color: item.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid ${item.color}25`,
                            flexShrink: 0
                        }}>
                            <CategoryIcon size={14} />
                        </div>

                        <h4 style={{
                            fontSize: '0.93rem', fontWeight: 800,
                            color: item.completed ? 'var(--text-muted)' : 'var(--text-main)',
                            position: 'relative',
                            transition: 'color 0.4s ease',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flex: 1,
                        }}>
                            {item.name}
                            {/* Strike-through line for completed */}
                            {item.completed && (
                                <span style={{
                                    position: 'absolute', left: 0, top: '54%',
                                    height: '1.5px', width: '100%',
                                    background: 'var(--text-muted)',
                                    borderRadius: '2px',
                                    animation: 'strike-in 0.3s ease-out forwards'
                                }} />
                            )}
                        </h4>
                    </div>

                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '36px' }}>
                        <span
                            className="task-category-chip"
                            style={{
                                background: `${item.color}15`,
                                color: item.color,
                                border: `1px solid ${item.color}25`
                            }}
                        >
                            <Zap size={9} />
                            {item.category}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>·</span>
                        <Calendar size={10} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Daily</span>

                        {item.completed && (
                            <>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>·</span>
                                <span style={{ fontSize: '0.6rem', color: '#10B981', fontWeight: 800, letterSpacing: '0.04em' }}>✓ COMPLETE</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Delete */}
                <button
                    onClick={() => onDelete(item.id)}
                    className="btn-icon-dim task-delete-btn"
                    style={{ zIndex: 2, flexShrink: 0 }}
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </>
    );
};

export default TaskNode;
