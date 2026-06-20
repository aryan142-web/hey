import React from 'react';
import { Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import { categoryIcons, premiumIcons } from '../../utils/constants';
import confetti from 'canvas-confetti';

const ManifestNode = ({ item, onToggle, onDelete }) => {
    const allIcons = { ...categoryIcons, ...premiumIcons };
    const CategoryIcon = allIcons[item.category?.toLowerCase()] || allIcons.other;

    const handleAcknowledge = () => {
        if (!item.completed) {
            confetti({
                particleCount: 100,
                spread: 70,
                colors: [item.color, '#FFFFFF', '#F59E0B'],
                origin: { y: 0.6 }
            });
        }
        onToggle(item.id);
    };

    return (
        <div className={`glass manifest-node card-hover-elite ${item.completed ? 'aligned' : ''}`} style={{
            padding: '1.5rem',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            border: item.completed ? `2px solid ${item.color}60` : '1px solid var(--glass-border)',
            background: item.completed ? `linear-gradient(135deg, ${item.color}15 0%, rgba(255,255,255,0.02) 100%)` : 'var(--bg-card)',
            boxShadow: item.completed ? `0 20px 40px ${item.color}15, inset 0 0 20px ${item.color}10` : 'none',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Glowing orb effect for active manifestations */}
            {!item.completed && (
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: `radial-gradient(circle, ${item.color}05 0%, transparent 60%)`,
                    animation: 'pulse 4s infinite alternate',
                    pointerEvents: 'none'
                }}></div>
            )}

            <button
                onClick={handleAcknowledge}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    border: `2px solid ${item.completed ? item.color : 'var(--ui-border-soft)'}`,
                    background: item.completed ? item.color : 'rgba(255,255,255,0.02)',
                    color: item.completed ? 'white' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: item.completed ? `0 0 15px ${item.color}60` : 'none'
                }}
            >
                {item.completed ? <CheckCircle2 size={24} strokeWidth={3} /> : <Sparkles size={20} />}
            </button>

            <div style={{ flex: 1, zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: `${item.color}15`,
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${item.color}20`
                    }}>
                        <CategoryIcon size={12} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: item.color, fontWeight: 950, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {item.category} Intention
                    </span>
                </div>

                <h4 style={{
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: item.completed ? 'var(--text-main)' : 'var(--text-main)',
                    lineHeight: '1.4',
                    letterSpacing: '-0.02em',
                    transition: 'all 0.3s ease',
                    textShadow: item.completed ? `0 0 20px ${item.color}40` : 'none'
                }}>
                    "{item.name}"
                </h4>

                <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: item.completed ? 'var(--success)' : 'var(--text-dim)' }}>
                        {item.completed ? 'Manifested & Aligned' : 'Working in the background'}
                    </span>
                </div>
            </div>

            <button onClick={() => onDelete(item.id)} className="btn-icon-dim" style={{ opacity: 0.4, zIndex: 1 }}>
                <Trash2 size={16} />
            </button>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    100% { transform: scale(1.05); opacity: 1; }
                }
                .btn-icon-dim {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .btn-icon-dim:hover {
                    color: var(--danger);
                    background: rgba(239, 68, 68, 0.1);
                    opacity: 1 !important;
                }
            `}</style>
        </div>
    );
};

export default ManifestNode;
