import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Zap, Target, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const FocusTimer = ({ setGlobalStatus, onTick }) => {
    const { logActivity, gainXP } = useApp();
    const [initialTime, setInitialTime] = useState(25 * 60);
    const [seconds, setSeconds] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [customMins, setCustomMins] = useState(25);
    const [vitals, setVitals] = useState({ effort: 7.8, zone: 'MODERATE', integrity: 'STABLE' });

    useEffect(() => {
        let interval = null;
        let vitalInterval = null;

        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(s => s - 1);
                if (onTick) onTick();
            }, 1000);

            vitalInterval = setInterval(() => {
                setVitals(prev => ({
                    ...prev,
                    effort: parseFloat((7.5 + Math.random() * 0.6).toFixed(1)),
                    zone: Math.random() > 0.8 ? 'DEEP' : 'MODERATE'
                }));
            }, 3000);

            setGlobalStatus({ label: 'SYNC_ACTIVE', color: 'var(--primary)', pulse: true });
        } else if (seconds === 0) {
            setIsActive(false);
            setGlobalStatus({ label: 'Finished', color: 'var(--success)', pulse: false });
            logActivity('focus_session', `Completed ${initialTime / 60}m focus session`);
            gainXP(Math.floor(initialTime / 60) * 10);
        } else {
            setGlobalStatus({ label: 'Idle', color: 'var(--text-dim)', pulse: false });
            setVitals(prev => ({ ...prev, effort: 0.0, zone: 'IDLE' }));
        }
        return () => {
            clearInterval(interval);
            clearInterval(vitalInterval);
        };
    }, [isActive, seconds, setGlobalStatus, onTick, initialTime]);

    const progress = useMemo(() => {
        return ((initialTime - seconds) / initialTime) * 100;
    }, [seconds, initialTime]);

    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggle = () => {
        if (!isActive) {
            logActivity('focus_session', `Started ${initialTime / 60}m focus session`);
        }
        setIsActive(!isActive);
        setIsEditing(false);
    };

    const reset = () => {
        setIsActive(false);
        setSeconds(initialTime);
        logActivity('focus_session', 'Focus session stopped');
    };

    const setPreset = (mins) => {
        if (isActive) return;
        const newTime = mins * 60;
        setInitialTime(newTime);
        setSeconds(newTime);
        setCustomMins(mins);
    };

    return (
        <div className="focus-timer-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>

            {/* Neural Progress Ring (Pure CSS) */}
            <div className="timer-ring-v2" style={{
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                background: `conic-gradient(var(--primary) ${progress}%, var(--ui-bg-low) ${progress}%)`,
                padding: '8px',
                boxShadow: isActive ? '0 0 40px var(--primary-glow)' : 'none',
                transition: 'box-shadow 1s ease'
            }}>
                <div className="glass" style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'var(--bg-dark)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--glass-border)',
                    position: 'relative',
                    zIndex: 2
                }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.2em', marginBottom: '0.5rem', fontWeight: 900 }}>Timer</div>
                    <div className="timer-display-enhanced" style={{ margin: '0.5rem 0', cursor: 'pointer' }} onClick={() => !isActive && setIsEditing(true)}>
                        {formatTime(seconds)}
                    </div>
                    <div style={{ color: isActive ? 'var(--primary)' : 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {isActive ? 'FOCUSING...' : 'READY'}
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="scan-line" style={{ display: isActive ? 'block' : 'none' }}></div>
            </div>

            {/* Tactical Controls */}
            <div className="timer-tactical-controls" style={{ width: '100%', maxWidth: '500px' }}>
                {!isActive && (
                    <div className="presets-row glass p-3" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '24px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
                            {[15, 25, 45, 60].map(mins => (
                                <button
                                    key={mins}
                                    onClick={() => {
                                        setPreset(mins);
                                        setIsEditing(false);
                                    }}
                                    className={`btn ${initialTime === mins * 60 && !isEditing ? 'btn-primary' : 'btn-glass'}`}
                                    style={{ flex: 1, borderRadius: '14px', fontSize: '0.85rem', fontWeight: 950 }}
                                >
                                    {mins}m
                                </button>
                            ))}
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`btn ${isEditing ? 'btn-primary' : 'btn-glass'}`}
                                style={{ flex: 1, borderRadius: '14px', fontSize: '0.85rem', fontWeight: 950 }}
                            >
                                Custom
                            </button>
                        </div>

                        {isEditing && (
                            <div className="custom-entry reveal-up" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '0.5rem' }}>
                                <input
                                    type="number"
                                    min="1"
                                    max="300"
                                    value={customMins}
                                    onChange={(e) => setCustomMins(parseInt(e.target.value) || '')}
                                    className="glass-input-premium"
                                    style={{
                                        flex: 2,
                                        padding: '0.8rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--primary)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: 900,
                                        textAlign: 'center'
                                    }}
                                />
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>MINUTES</span>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (customMins > 0) {
                                            setPreset(customMins);
                                            setIsEditing(false);
                                        }
                                    }}
                                    style={{ flex: 1, borderRadius: '12px', padding: '0.8rem', fontSize: '0.8rem', fontWeight: 950 }}
                                >
                                    SET
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="main-actions" style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-primary btn-lg" onClick={toggle} style={{ flex: 2, height: '60px', borderRadius: '16px', fontSize: '1rem' }}>
                        {isActive ? <Pause size={20} /> : <Play size={20} />}
                        <span style={{ marginLeft: '0.8rem' }}>{isActive ? 'Pause' : 'Start'}</span>
                    </button>
                    <button className="btn btn-glass btn-lg" onClick={reset} style={{ flex: 1, height: '60px', borderRadius: '16px' }}>
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            {/* Environmental Logs */}
            <div className="focus-enviro-logs" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%', maxWidth: '700px' }}>
                <div className="glass p-5" style={{ borderRadius: '20px', textAlign: 'center' }}>
                    <ShieldCheck size={20} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>STATUS</div>
                    <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>{vitals.integrity}</div>
                </div>
                <div className="glass p-5" style={{ borderRadius: '20px', textAlign: 'center' }}>
                    <Zap size={20} color="var(--warning)" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>INTENSITY</div>
                    <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>{vitals.effort} %</div>
                </div>
                <div className="glass p-5" style={{ borderRadius: '20px', textAlign: 'center' }}>
                    <Target size={20} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>MODE</div>
                    <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>{vitals.zone}</div>
                </div>
            </div>

            <style>{`
                .timer-ring-v2::before {
                    content: '';
                    position: absolute;
                    inset: -15px;
                    border: 1px solid var(--glass-border);
                    border-radius: 50%;
                    opacity: 0.3;
                }
                .scan-line {
                    position: absolute;
                    width: 2px;
                    height: 50%;
                    background: linear-gradient(to bottom, transparent, var(--primary), transparent);
                    top: 0;
                    left: 50%;
                    transform-origin: bottom center;
                    animation: radar-sweep 4s linear infinite;
                    z-index: 1;
                }
                @keyframes radar-sweep {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default FocusTimer;
