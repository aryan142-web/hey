import React, { useState, useEffect } from 'react';

const BootTerminal = () => {
    const [logs, setLogs] = useState([
        "> Starting application...",
        "> Connecting to secure server...",
        "> Loading your preferences..."
    ]);

    const additionalLogs = [
        "> Login confirmed.",
        "> Session ready.",
        "> Syncing habits and tasks...",
        "> Updates complete.",
        "> All systems ready.",
        "> Welcome back."
    ];

    useEffect(() => {
        let timer;
        let index = 0;

        const addLog = () => {
            if (index < additionalLogs.length) {
                setLogs(prev => [...prev, additionalLogs[index]]);
                index++;
                timer = setTimeout(addLog, Math.random() * 200 + 100);
            }
        };

        timer = setTimeout(addLog, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="boot-terminal" style={{
            height: '100vh',
            background: 'var(--bg-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
        }}>
            <div className="boot-content" style={{ maxWidth: '600px', width: '100%', position: 'relative' }}>
                {/* Logo Pulse */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4rem', position: 'relative' }}>
                    <div className="pulsing" style={{ position: 'absolute', width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(70px)', opacity: 0.25, borderRadius: '50%' }}></div>
                    <img src="/logo.png" alt="LifeFlow" style={{ width: '180px', height: 'auto', position: 'relative', zIndex: 10, borderRadius: '24px', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))' }} />
                </div>

                {/* Progress System */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '0.2em' }}>
                        <span>STARTING_UP</span>
                        <span>{Math.min(100, (logs.length / 9) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="boot-loader" style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div className="boot-bar" style={{
                            height: '100%',
                            background: 'var(--primary)',
                            width: `${(logs.length / 9) * 100}%`,
                            boxShadow: '0 0 20px var(--primary)',
                            transition: 'width 0.3s ease'
                        }}></div>
                    </div>
                </div>

                {/* Live Console Output */}
                <div className="boot-logs" style={{
                    background: 'rgba(255,255,255,0.02)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    height: '240px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    {logs.map((log, i) => (
                        <p key={i} style={{
                            fontSize: '0.8rem',
                            color: log.includes('SUCCESS') || log.includes('OK') ? 'var(--success)' : 'var(--text-dim)',
                            margin: 0,
                            animation: 'log-fade 0.3s ease forwards'
                        }}>
                            {log}
                        </p>
                    ))}
                    <div style={{ width: '8px', height: '14px', background: 'var(--primary)', animation: 'blink 1s step-end infinite' }}></div>
                </div>
            </div>

            <style>{`
                @keyframes blink { 50% { opacity: 0; } }
                @keyframes log-fade { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                .pulsing { animation: pulse-core 2s ease-in-out infinite; }
                @keyframes pulse-core { 0% { transform: scale(0.9); opacity: 0.3; } 50% { transform: scale(1.1); opacity: 0.6; } 100% { transform: scale(0.9); opacity: 0.3; } }
            `}</style>
        </div>
    );
};

export default BootTerminal;
