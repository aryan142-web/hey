import React from 'react';
import { Clock, Zap, Target, Award, Brain, Activity, ShieldCheck, Sparkles, LogIn, LogOut, Settings } from 'lucide-react';

const ActivityTimeline = ({ activityLog }) => {
    if (!activityLog || activityLog.length === 0) {
        return (
            <div className="glass p-8 text-center" style={{ borderRadius: '24px', background: 'var(--ui-bg-low)', border: '1px solid var(--ui-border-soft)' }}>
                <Clock size={40} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <p style={{ color: 'var(--text-dim)', fontWeight: 600 }}>No activity recorded in current cycle.</p>
            </div>
        );
    }

    const getIcon = (type) => {
        switch (type) {
            case 'completion': return <Target size={14} color="var(--primary)" />;
            case 'level_up': return <Award size={14} color="var(--warning)" />;
            case 'distraction': return <Activity size={14} color="var(--danger)" />;
            case 'creation': return <Sparkles size={14} color="var(--secondary)" />;
            case 'system': return <ShieldCheck size={14} color="var(--primary)" />;
            case 'focus': return <Brain size={14} color="var(--primary)" />;
            case 'navigation': return <Layers size={14} color="var(--primary)" />;
            default: return <Clock size={14} color="var(--text-dim)" />;
        }
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {activityLog.map((log, index) => (
                <div
                    key={log.id}
                    className="timeline-item glass"
                    style={{
                        padding: '1rem 1.5rem',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.2rem',
                        background: 'var(--ui-bg-low)',
                        border: '1px solid var(--ui-border-soft)',
                        position: 'relative',
                        animation: `slide-in 0.4s ease-out ${index * 0.05}s forwards`,
                        opacity: 0,
                        transform: 'translateX(-10px)'
                    }}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: 'var(--glass-highlight)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--ui-border-soft)'
                    }}>
                        {getIcon(log.type)}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                {log.type.replace('_', ' ')}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                                {formatTime(log.timestamp)}
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {log.label}
                        </p>
                    </div>

                    {index < activityLog.length - 1 && (
                        <div style={{
                            position: 'absolute',
                            left: '31px',
                            top: '42px',
                            width: '1px',
                            height: '20px',
                            background: 'linear-gradient(to bottom, var(--ui-border-soft), transparent)'
                        }}></div>
                    )}
                </div>
            ))}

            <style>{`
                @keyframes slide-in {
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .timeline-item:hover {
                    border-color: var(--primary) !important;
                    background: var(--glass-highlight) !important;
                    transform: scale(1.01) !important;
                }
            `}</style>
        </div>
    );
};

export default ActivityTimeline;
