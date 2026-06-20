import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { jwtDecode } from 'jwt-decode';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

const getTodayStr = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
};

const calculateStreak = (history = {}, target = 1) => {
    let streak = 0;
    const today = new Date();
    let current = new Date(today);
    
    const formatDate = (d) => {
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
    };
    
    let todayStr = formatDate(current);
    const completedToday = (history[todayStr] || 0) >= target;
    
    current.setDate(current.getDate() - 1);
    let yesterdayStr = formatDate(current);
    const completedYesterday = (history[yesterdayStr] || 0) >= target;
    
    if (!completedToday && !completedYesterday) {
        return 0;
    }
    
    current = new Date(today);
    while (true) {
        const dateStr = formatDate(current);
        const val = history[dateStr] || 0;
        if (val >= target) {
            streak++;
            current.setDate(current.getDate() - 1);
        } else {
            if (dateStr === formatDate(today)) {
                current.setDate(current.getDate() - 1);
                continue;
            }
            break;
        }
    }
    return streak;
};

export const AppProvider = ({ children }) => {
    // START AT ZERO: ABSOLUTE BASELINE
    const initialProfile = useMemo(() => ({
        xp: 0,
        level: 0,
        name: 'User',
        birthDate: '',
        expectancy: 85,
        tier: 'Free'
    }), []);

    const initialScreenTime = useMemo(() => ({
        total: 0,
        views: { focus: 0, habits: 0, tasks: 0, manifest: 0, screentime: 0, settings: 0, schedule: 0, premium: 0 },
        activityLog: []
    }), []);

    const initialFocusPerformance = useMemo(() => ({
        deepWorkMinutes: 0,
        distractionCount: 0,
        lastSessionScore: 0,
        syncStability: 100
    }), []);

    // State initialization
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('pi78_auth_user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    });

    const [items, setItems] = useState(() => {
        try {
            const saved = localStorage.getItem('pi78_lifetime_items');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    const [profile, setProfile] = useState(() => {
        try {
            const saved = localStorage.getItem('pi78_lifetime_profile');
            return saved ? JSON.parse(saved) : initialProfile;
        } catch (e) { return initialProfile; }
    });

    const [screenTime, setScreenTime] = useState(() => {
        try {
            const saved = localStorage.getItem('pi78_screen_time');
            return saved ? JSON.parse(saved) : initialScreenTime;
        } catch (e) { return initialScreenTime; }
    });

    const [focusPerformance, setFocusPerformance] = useState(() => {
        try {
            const saved = localStorage.getItem('pi78_focus_performance');
            return saved ? JSON.parse(saved) : initialFocusPerformance;
        } catch (e) { return initialFocusPerformance; }
    });

    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        try {
            return localStorage.getItem('pi78_notifications') === 'true';
        } catch (e) { return false; }
    });

    const [activeView, setActiveView] = useState('habits');
    const [isBooting, setIsBooting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('any');
    const [systemStatus, setSystemStatus] = useState({ label: 'Online', color: 'var(--primary)', pulse: true });

    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('pi78_theme');
        return saved || 'dark';
    });

    const [subTheme, setSubTheme] = useState(() => {
        const saved = localStorage.getItem('pi78_sub_theme');
        return saved || 'human';
    });

    // POSSESSION PERSISTENCE (Local)
    useEffect(() => { localStorage.setItem('pi78_lifetime_items', JSON.stringify(items)); }, [items]);
    useEffect(() => { localStorage.setItem('pi78_lifetime_profile', JSON.stringify(profile)); }, [profile]);
    useEffect(() => { localStorage.setItem('pi78_screen_time', JSON.stringify(screenTime)); }, [screenTime]);
    useEffect(() => { localStorage.setItem('pi78_focus_performance', JSON.stringify(focusPerformance)); }, [focusPerformance]);
    useEffect(() => { localStorage.setItem('pi78_theme', theme); }, [theme]);
    useEffect(() => { localStorage.setItem('pi78_sub_theme', subTheme); }, [subTheme]);
    useEffect(() => { localStorage.setItem('pi78_notifications', String(notificationsEnabled)); }, [notificationsEnabled]);

    // SUPABASE SYNC (Remote)
    const syncToSupabase = useCallback(async () => {
        if (!user?.email) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    email: user.email,
                    name: user.name || profile.name,
                    tier: profile.tier,
                    xp: profile.xp,
                    level: profile.level,
                    items: items,
                    screen_time: screenTime,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'email' });

            if (error) console.error('Supabase Sync Error:', error);
        } catch (err) {
            console.error('Supabase Connection Failed:', err);
        }
    }, [user, profile, items, screenTime]);

    // Sync debounce/trigger
    useEffect(() => {
        const timeout = setTimeout(() => {
            syncToSupabase();
        }, 3000); // Sync every 3 seconds after last change
        return () => clearTimeout(timeout);
    }, [profile, items, screenTime, syncToSupabase]);

    // Load from Supabase on Mount (Restore Cloud Session)
    useEffect(() => {
        if (user?.email) {
            loadFromSupabase(user.email);
        }
    }, []);

    // Load from Supabase on Login
    const loadFromSupabase = useCallback(async (email) => {
        if (!email) return;

        setSystemStatus({ label: 'Syncing Cloud Storage', color: 'var(--primary)', pulse: true });
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', email)
                .single();

            if (data) {
                setProfile(prev => {
                    // Prevent overwriting a fresh local payment upgrade with stale cloud data
                    const searchParams = new URLSearchParams(window.location.search);
                    const isNewPayment = searchParams.get('payment') === 'success';
                    const activeTier = isNewPayment ? (searchParams.get('plan') || 'Basic') : (data.tier || 'Free');

                    return {
                        ...prev,
                        xp: data.xp || 0,
                        level: data.level || 0,
                        tier: activeTier,
                        name: data.name || prev.name
                    };
                });
                setItems(data.items || []);
                setScreenTime(data.screen_time || initialScreenTime);
                setSystemStatus({ label: 'Cloud Synced', color: 'var(--success)', pulse: false });
                setTimeout(() => setSystemStatus({ label: 'Online', color: 'var(--primary)', pulse: true }), 2000);
            }
        } catch (err) {
            console.error('Supabase Load Error:', err);
        }
    }, [initialScreenTime]);

    const logActivity = useCallback((type, label, metadata = {}) => {
        setScreenTime(prev => {
            const now = Date.now();
            return {
                ...prev,
                activityLog: [
                    { id: now, timestamp: new Date().toISOString(), type, label, ...metadata },
                    ...prev.activityLog
                ].slice(0, 50)
            };
        });
    }, []);

    const navigateTo = useCallback((view) => {
        setActiveView(view);
    }, []);

    const gainXP = useCallback((amount) => {
        setProfile(prev => {
            const newXP = prev.xp + amount;
            const newLevel = Math.floor(newXP / 100);
            return { ...prev, xp: newXP, level: newLevel };
        });
    }, []);

    // Level up effects
    useEffect(() => {
        if (profile.level > 0) {
            confetti({
                particleCount: 150,
                spread: 70,
                colors: ['#06B6D4', '#10B981'],
                origin: { y: 0.6 }
            });
            logActivity('level_up', `Reached Level ${profile.level}`);
        }
    }, [profile.level, logActivity]);

    const toggleTask = useCallback((id) => {
        setItems(prev => prev.map(i => {
            if (i.id === id && i.type === 'task') {
                const completed = !i.completed;
                const today = getTodayStr();
                const taskHistory = { ...(i.taskHistory || {}) };
                taskHistory[today] = completed ? 1 : 0;
                if (completed) {
                    setTimeout(() => {
                        gainXP(20);
                        logActivity('completion', `Completed ${i.type}: ${i.name}`);
                    }, 0);
                }
                return { ...i, completed, streak: completed ? i.streak + 1 : Math.max(0, i.streak - 1), taskHistory };
            }
            return i;
        }));
    }, [gainXP, logActivity]);

    const updateTrackerValue = useCallback((id, delta) => {
        setItems(prev => prev.map(i => {
            if (i.id === id && (i.type === 'tracker' || i.type === 'time')) {
                const today = getTodayStr();
                const newValue = Math.max(0, i.value + delta);
                const history = { ...(i.history || {}) };
                history[today] = newValue;

                if (newValue >= i.target && i.value < i.target) {
                    setTimeout(() => {
                        gainXP(50);
                        logActivity('completion', `${i.type === 'time' ? 'Duration' : 'Habit'} target reached: ${i.name}`);
                    }, 0);
                }

                const updatedItem = {
                    ...i,
                    value: newValue,
                    completed: newValue >= i.target,
                    history
                };
                updatedItem.streak = calculateStreak(history, i.target);
                return updatedItem;
            }
            return i;
        }));
    }, [gainXP, logActivity]);

    const toggleTrackerDate = useCallback((id, dateStr) => {
        setItems(prev => prev.map(i => {
            if (i.id === id && (i.type === 'tracker' || i.type === 'time')) {
                const history = { ...(i.history || {}) };
                const today = getTodayStr();
                
                const currentValue = history[dateStr] || 0;
                const isCompleted = currentValue >= i.target;
                
                const newValue = isCompleted ? 0 : i.target;
                history[dateStr] = newValue;
                
                let updatedItem = {
                    ...i,
                    history
                };
                
                if (dateStr === today) {
                    updatedItem.value = newValue;
                    updatedItem.completed = newValue >= i.target;
                }
                
                if (newValue >= i.target && currentValue < i.target) {
                    setTimeout(() => {
                        gainXP(50);
                        logActivity('completion', `${i.type === 'time' ? 'Duration' : 'Habit'} target reached: ${i.name} on ${dateStr}`);
                    }, 0);
                }
                
                updatedItem.streak = calculateStreak(history, i.target);
                return updatedItem;
            }
            return i;
        }));
    }, [gainXP, logActivity]);

    const handleAddEntry = useCallback((entryData) => {
        const newItem = {
            id: Date.now(),
            ...entryData,
            completed: false,
            streak: 0,
            value: 0
        };
        setItems(prev => [...prev, newItem]);
        setIsModalOpen(false);
        logActivity('creation', `Created ${entryData.type}: ${entryData.name}`);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }, [logActivity]);

    const openModal = useCallback((type = 'any') => {
        setModalType(type);
        setIsModalOpen(true);
    }, []);

    const logDistraction = useCallback(() => {
        setFocusPerformance(prev => ({
            ...prev,
            distractionCount: prev.distractionCount + 1,
            syncStability: Math.max(0, prev.syncStability - 5)
        }));
        setSystemStatus({ label: 'Issue Detected', color: 'var(--danger)', pulse: true });
        logActivity('distraction', 'Distraction recorded');
        setTimeout(() => setSystemStatus({ label: 'Online', color: 'var(--primary)', pulse: true }), 3000);
    }, [logActivity]);


    const handleLoginSuccess = useCallback((res) => {
        setIsBooting(true); // Instantly show boot screen
        const decoded = jwtDecode(res.credential);
        const newUser = {
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture
        };
        setUser(newUser);
        localStorage.setItem('pi78_auth_user', JSON.stringify(newUser));

        // Let it load in the background without blocking the UI
        loadFromSupabase(decoded.email);

        // Drop boot screen practically instantly (Guaranteed fast login)
        setTimeout(() => setIsBooting(false), 400);
    }, [loadFromSupabase]);

    const handleLogout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('pi78_auth_user');
        navigateTo('habits');
    }, [navigateTo]);

    const resetAllProgress = useCallback(() => {
        setItems([]);
        setProfile(initialProfile);
        setScreenTime(initialScreenTime);
        setFocusPerformance(initialFocusPerformance);
        logActivity('system', 'All data was reset');
    }, [initialProfile, initialScreenTime, initialFocusPerformance, logActivity]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    const toggleSubTheme = useCallback(() => {
        setSubTheme(prev => prev === 'cyber' ? 'human' : 'cyber');
    }, []);

    const setTier = useCallback((tier) => {
        setProfile(prev => ({ ...prev, tier }));
    }, []);

    const requestNotificationPermission = useCallback(async () => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            setNotificationsEnabled(true);
            return true;
        }
        return false;
    }, []);

    const sendNotification = useCallback((title, body) => {
        if (notificationsEnabled) {
            new Notification(title, { body, icon: '/logo.png' });
        }
    }, [notificationsEnabled]);

    const value = useMemo(() => ({
        items, setItems,
        profile, setProfile,
        screenTime, setScreenTime,
        user, setUser,
        activeView, setActiveView,
        navigateTo,
        isBooting, setIsBooting,
        isModalOpen, setIsModalOpen,
        modalType, setModalType,
        openModal,
        systemStatus, setSystemStatus,
        gainXP,
        toggleTask,
        updateTrackerValue,
        toggleTrackerDate,
        handleAddEntry,
        handleLoginSuccess,
        handleLogout,
        resetAllProgress,
        theme, setTheme, toggleTheme,
        subTheme, setSubTheme, toggleSubTheme,
        focusPerformance, setFocusPerformance,
        logDistraction,
        notificationsEnabled,
        requestNotificationPermission,
        sendNotification,
        setTier
    }), [
        items, profile, screenTime, user, activeView, navigateTo,
        isBooting, isModalOpen, modalType, openModal,
        systemStatus, gainXP, toggleTask, updateTrackerValue, toggleTrackerDate,
        handleAddEntry, handleLoginSuccess, handleLogout,
        resetAllProgress, theme, toggleTheme, subTheme, toggleSubTheme, focusPerformance,
        logDistraction, notificationsEnabled,
        requestNotificationPermission, sendNotification, setTier
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within an AppProvider');
    return context;
};
