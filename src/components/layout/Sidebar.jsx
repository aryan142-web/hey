import { ListChecks, Timer, Clock, Crown, LogOut, Settings, Sun, Moon, Repeat, Calendar, Activity, Sparkles, Lock, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DoodleScratchpad from '../common/DoodleScratchpad';

const navItems = [
    { id: 'habits', icon: Repeat, label: 'Habits', color: '#10B981' },
    { id: 'tasks', icon: ListChecks, label: 'Tasks', color: '#06B6D4' },
    { id: 'screentime', icon: Activity, label: 'Sit Proper', color: '#EF4444' },
    { id: 'premium', icon: Crown, label: 'Premium', color: '#F59E0B' },
];

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
    const { activeView, navigateTo, user, profile, handleLogout, theme, toggleTheme, subTheme } = useApp();
    const isPremium = profile.tier !== 'Free';
    const initials = (user?.name || profile.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <>
            <style>{`
                .sidebar-inner {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    position: relative;
                    z-index: 2;
                }
                .sidebar-bg-glow {
                    position: absolute;
                    width: 200px;
                    height: 200px;
                    border-radius: 50%;
                    filter: blur(80px);
                    pointer-events: none;
                    z-index: 0;
                }
                .sidebar-nav-item {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                    padding: 0.7rem 1rem;
                    border-radius: 14px;
                    color: var(--text-dim);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.875rem;
                    letter-spacing: 0.01em;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid transparent;
                    overflow: hidden;
                    cursor: pointer;
                }
                .sidebar-nav-item::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 0; bottom: 0;
                    width: 3px;
                    border-radius: 0 3px 3px 0;
                    background: var(--item-color, var(--primary));
                    transform: scaleY(0);
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .sidebar-nav-item.active::before {
                    transform: scaleY(1);
                }
                .sidebar-nav-item.active {
                    background: color-mix(in srgb, var(--item-color, var(--primary)) 12%, transparent);
                    border-color: color-mix(in srgb, var(--item-color, var(--primary)) 25%, transparent);
                    color: var(--text-main);
                    box-shadow: 0 4px 20px -4px color-mix(in srgb, var(--item-color, var(--primary)) 30%, transparent);
                }
                .sidebar-nav-item:not(.active):hover {
                    background: var(--ui-bg-low);
                    color: var(--text-main);
                    border-color: var(--ui-border-soft);
                    transform: translateX(3px);
                }
                .sidebar-nav-item:not(.active):hover .nav-icon-wrap {
                    transform: scale(1.15) rotate(-5deg);
                }
                .sidebar-nav-item.active .nav-icon-wrap {
                    background: color-mix(in srgb, var(--item-color, var(--primary)) 20%, transparent);
                    box-shadow: 0 0 14px color-mix(in srgb, var(--item-color, var(--primary)) 50%, transparent);
                }
                .nav-icon-wrap {
                    width: 34px;
                    height: 34px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--ui-bg-low);
                    flex-shrink: 0;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .nav-label-text {
                    flex: 1;
                    transition: transform 0.25s ease;
                }
                .sidebar-nav-item:not(.active):hover .nav-label-text {
                    transform: translateX(2px);
                }
                .nav-chevron {
                    opacity: 0;
                    transform: translateX(-4px);
                    transition: all 0.2s ease;
                }
                .sidebar-nav-item.active .nav-chevron {
                    opacity: 0.5;
                    transform: translateX(0);
                }
                /* Avatar */
                .sidebar-avatar {
                    width: 38px;
                    height: 38px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    font-size: 0.8rem;
                    color: #fff;
                    flex-shrink: 0;
                    position: relative;
                    letter-spacing: 0.05em;
                    transition: all 0.3s ease;
                }
                .sidebar-avatar::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 10px;
                    height: 10px;
                    background: #10B981;
                    border: 2px solid var(--sidebar-bg);
                    border-radius: 50%;
                    box-shadow: 0 0 6px rgba(16,185,129,0.6);
                }
                .sidebar-usercard {
                    margin-top: auto;
                    padding: 0.75rem;
                    border-radius: 18px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
                    border: 1px solid rgba(255,255,255,0.07);
                    backdrop-filter: blur(20px);
                    transition: all 0.3s ease;
                }
                .sidebar-usercard:hover {
                    background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
                    border-color: rgba(255,255,255,0.12);
                }
                .light-theme .sidebar-usercard {
                    background: rgba(6,182,212,0.04);
                    border-color: rgba(6,182,212,0.1);
                }
                .sidebar-action-btn {
                    flex: 1;
                    height: 32px;
                    border-radius: 9px;
                    border: 1px solid var(--ui-border-soft);
                    background: var(--ui-bg-low);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative;
                    overflow: hidden;
                }
                .sidebar-action-btn:hover {
                    transform: translateY(-2px) scale(1.05);
                    border-color: var(--primary);
                    box-shadow: 0 4px 12px var(--primary-glow);
                }
                .sidebar-action-btn.danger:hover {
                    border-color: var(--danger);
                    box-shadow: 0 4px 12px rgba(239,68,68,0.3);
                }
                .sidebar-action-btn:active {
                    transform: scale(0.95);
                }
                .sidebar-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, var(--ui-border-soft), transparent);
                    margin: 1rem 0.5rem;
                }
                /* Logo wrap */
                .logo-wrap {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.5rem 1rem 1.5rem;
                    position: relative;
                }
                .logo-wrap::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 20%;
                    right: 20%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, var(--primary-glow), transparent);
                }
            `}</style>

            <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
                {/* Ambient bg glows */}
                <div className="sidebar-bg-glow" style={{ top: '-50px', left: '-50px', background: 'var(--primary-glow)', opacity: 0.12 }} />
                <div className="sidebar-bg-glow" style={{ bottom: '-80px', right: '-60px', background: 'var(--secondary-glow)', opacity: 0.08 }} />

                <div className="sidebar-inner">
                    {/* Logo */}
                    <div className="logo-wrap">
                        <img
                            src="/logo.png"
                            alt="LifeFlow"
                            className="logo-breathe"
                            style={{ width: '52%', height: 'auto', borderRadius: '16px', position: 'relative', zIndex: 2, filter: 'drop-shadow(0 4px 16px var(--primary-glow))' }}
                        />
                    </div>

                    {/* Nav */}
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: '0 1 auto', overflowY: 'auto', padding: '0.25rem 0.2rem', marginBottom: '0.5rem' }}>
                        {navItems.map((item, idx) => {
                            const isLocked = item.id === 'screentime' && profile.tier === 'Free';
                            const isActive = activeView === item.id;
                            return (
                                <a
                                    key={item.id}
                                    href="#"
                                    className={`sidebar-nav-item slide-in-left stagger-${Math.min(idx + 1, 8)} ${isActive ? 'active' : ''}`}
                                    style={{ '--item-color': item.color, opacity: isLocked ? 0.6 : 1 }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (isLocked) {
                                            alert("Please upgrade to Basic plan or higher to unlock Sit Proper!");
                                            navigateTo('premium');
                                            return;
                                        }
                                        navigateTo(item.id);
                                        setIsMobileOpen(false);
                                    }}
                                >
                                    <span className="nav-icon-wrap" style={{ color: isActive ? item.color : 'var(--text-dim)' }}>
                                        <item.icon size={16} strokeWidth={2.5} />
                                    </span>
                                    <span className="nav-label-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {item.label}
                                        {isLocked && <Lock size={12} color="#F59E0B" />}
                                    </span>
                                    <ChevronRight size={12} className="nav-chevron" style={{ color: item.color }} />
                                </a>
                            );
                        })}
                    </nav>

                    {/* Doodle Scratchpad (Human Mode exclusive!) */}
                    {subTheme === 'human' && <DoodleScratchpad />}

                    {/* Divider */}
                    <div className="sidebar-divider" />

                    {/* User card */}
                    <div className="sidebar-usercard float-up-in stagger-8">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.65rem' }}>
                            <div
                                className="sidebar-avatar"
                                style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: '0 0 16px var(--primary-glow)' }}
                            >
                                {initials}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                                    {user?.name || profile.name}
                                </p>
                                <span style={{ fontSize: '0.6rem', fontWeight: 900, color: isPremium ? '#F59E0B' : 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                    {isPremium ? '⚡ ' + profile.tier : '✦ Free'}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="sidebar-action-btn ripple-host" title="Toggle Theme" onClick={toggleTheme}>
                                {theme === 'dark' ? <Sun size={13} color="var(--primary)" /> : <Moon size={13} color="var(--primary)" />}
                            </button>
                            <button className="sidebar-action-btn ripple-host" title="Settings" onClick={() => { navigateTo('settings'); setIsMobileOpen(false); }}>
                                <Settings size={13} color="var(--text-dim)" />
                            </button>
                            <button className="sidebar-action-btn danger ripple-host" title="Logout" onClick={handleLogout}>
                                <LogOut size={13} color="var(--danger)" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
