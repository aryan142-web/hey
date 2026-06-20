import React, { useState } from 'react';
import { Plus, Wifi, Zap, ShieldCheck, Maximize2, Minimize2, Sun, Moon, Palette, Laptop } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TopBar = () => {
    const { openModal, theme, toggleTheme, subTheme, toggleSubTheme, profile, navigateTo } = useApp();
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                console.error(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleSubThemeToggle = () => {
        if (subTheme === 'cyber' && (profile.tier === 'Free' || profile.tier === 'Basic')) {
            alert("Upgrade to Pro or Lifetime plan to unlock pi+ mode!");
            navigateTo('premium');
            return;
        }
        toggleSubTheme();
    };

    return (
        <header className="top-bar glass-nav" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 }}>
            <style>{`
                @media (max-width: 1024px) {
                    .top-bar { padding: 0 1.5rem; }
                    .top-bar-meta .meta-item:not(:first-child) { display: none !important; }
                }
                @media (max-width: 640px) {
                    .top-bar-meta { gap: 1rem !important; }
                    .top-bar .btn-primary span { display: none; }
                    .top-bar .btn-primary { width: 44px; padding: 0 !important; display: flex; align-items: center; justify-content: center; }
                }
                .topbar-theme-btn {
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, box-shadow 0.3s ease;
                }
                .topbar-theme-btn:hover {
                    transform: rotate(20deg) scale(1.15);
                    background: var(--ui-bg-low);
                    box-shadow: 0 0 16px var(--primary-glow);
                }
                .topbar-fs-btn {
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease;
                }
                .topbar-fs-btn:hover {
                    transform: scale(1.15);
                    background: var(--ui-bg-low);
                }
            `}</style>
            <div className="top-bar-meta desktop-only slide-in-left" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                {/* System Telemetry Removed per user request */}
            </div>

            {/* Action Cluster */}
            <div className="slide-in-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    className="btn btn-glass topbar-theme-btn"
                    onClick={toggleTheme}
                    title={theme === 'dark' ? "Switch to Light Mode" : "Return to Dark Mode"}
                    aria-label="Toggle Theme"
                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '12px', color: 'var(--text-dim)' }}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button
                    className="btn btn-glass topbar-theme-btn"
                    onClick={handleSubThemeToggle}
                    title={subTheme === 'cyber' ? "Switch to pi plus mode" : "Switch to pi mode"}
                    aria-label="Toggle Subtheme"
                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '12px', color: 'var(--text-dim)' }}
                >
                    {subTheme === 'cyber' ? <Palette size={18} /> : <Laptop size={18} />}
                </button>

                <button
                    className="btn btn-glass topbar-fs-btn desktop-only"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '12px', color: 'var(--text-dim)' }}
                >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>

                <div className="desktop-only" style={{ width: '1px', height: '24px', background: 'var(--ui-border-soft)', margin: '0 0.5rem' }}></div>

                <button
                    className="btn btn-primary quickadd-pulse ripple-host"
                    onClick={() => openModal()}
                    aria-label="Quick Add"
                    style={{
                        height: '44px',
                        padding: '0 1.5rem',
                        borderRadius: '14px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        boxShadow: '0 10px 25px rgba(6, 182, 212, 0.25)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                >
                    <Plus size={16} strokeWidth={3} />
                    <span style={{ marginLeft: '0.5rem' }}>Quick Add</span>
                </button>
            </div>
        </header>
    );
};

export default TopBar;
