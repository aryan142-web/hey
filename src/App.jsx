import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useApp } from './context/AppContext';

// Layout components
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import BootTerminal from './components/layout/BootTerminal';
import LandingView from './components/views/LandingView';

// Lazy-loaded Views (Code Splitting for SPEED! 🚀)
const HabitsView = lazy(() => import('./components/views/HabitsView'));
const TasksView = lazy(() => import('./components/views/TasksView'));
const ScreenTimeView = lazy(() => import('./components/views/ScreenTimeView'));
const SettingsView = lazy(() => import('./components/views/SettingsView'));
const PremiumView = lazy(() => import('./components/views/PremiumView'));

// Common
import NewEntryModal from './components/common/NewEntryModal';

// Utils
import { auraThemes } from './utils/constants';

function App() {
    const {
        user,
        activeView,
        setActiveView,
        isBooting,
        setIsBooting,
        isModalOpen,
        setIsModalOpen,
        handleAddEntry,
        setScreenTime,
        logDistraction,
        setTier,
        theme,
        subTheme
    } = useApp();

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // PAYMENT SUCCESS HANDLER (Global)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success') {
            const planName = params.get('plan') || 'Basic';

            // Immediately apply the tier locally to avoid race conditions with Supabase Load
            setTier(planName);

            setTimeout(() => {
                import('canvas-confetti').then(confetti => {
                    confetti.default({
                        particleCount: 200,
                        spread: 90,
                        origin: { y: 0.6 },
                        colors: ['#8B5CF6', '#06B6D4', '#F59E0B'],
                        zIndex: 9999
                    });
                });
                alert(`SUCCESS: Your ${planName} protocol has been established and secured to your account!`);
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 500);
        }
    }, [setTier]);

    // REAL-TIME FOCUS SYNC (Checks every second)
    useEffect(() => {
        if (!user) return;

        const bootSafety = setTimeout(() => {
            if (isBooting) {
                console.log("Sync safety triggered: Forcing boot sequence completion");
                setIsBooting(false);
            }
        }, 5000);

        const syncInterval = setInterval(() => {
            if (document.visibilityState === 'visible' && !isBooting) {
                setScreenTime(prev => {
                    if (!prev) return prev;
                    const views = prev.views || {};
                    return {
                        ...prev,
                        total: (prev.total || 0) + 1,
                        views: {
                            ...views,
                            [activeView]: (views[activeView] || 0) + 1
                        }
                    };
                });
            }
        }, 1000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                logDistraction();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(syncInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearTimeout(bootSafety);
        };
    }, [user, isBooting, activeView, logDistraction, setScreenTime]);

    if (isBooting) return <BootTerminal />;
    if (!user) return <LandingView />;

    const renderView = () => {
        switch (activeView) {
            case 'habits': return <HabitsView />;
            case 'tasks': return <TasksView />;
            case 'screentime': return <ScreenTimeView />;
            case 'premium': return <PremiumView />;
            case 'settings': return <SettingsView />;
            default: return <HabitsView />;
        }
    };

    const getViewAura = () => {
        return auraThemes[activeView] || '';
    };

    return (
        <div className={`app-container ${getViewAura()} ${theme === 'light' ? 'light-theme' : ''} ${subTheme === 'human' ? 'human-theme' : ''}`}>
            <div className="noise-overlay"></div>
            <button
                className={`mobile-menu-toggle ${isMobileSidebarOpen ? 'active' : ''}`}
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                aria-label="Toggle Menu"
            >
                <span></span><span></span><span></span>
            </button>

            <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />

            {isMobileSidebarOpen && (
                <div
                    className="mobile-sidebar-backdrop"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'var(--ui-bg-low)', zIndex: 9999, backdropFilter: 'blur(4px)' }}
                />
            )}

            <main className="main-content">
                <TopBar />
                <div className="content-scroll">
                    <Suspense fallback={
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', color: '#06b6d4' }}>
                            <div style={{ animation: 'spin 1s linear infinite', width: '30px', height: '30px', border: '3px solid rgba(6, 182, 212, 0.2)', borderTopColor: '#06b6d4', borderRadius: '50%' }}></div>
                        </div>
                    }>
                        <div key={activeView} className="view-transition-wrapper" style={{ height: '100%' }}>
                            {renderView()}
                        </div>
                    </Suspense>
                </div>
            </main>

            <NewEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddEntry}
            />
        </div>
    );
}

export default App;
