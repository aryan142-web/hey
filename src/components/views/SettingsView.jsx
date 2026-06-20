import React, { useState } from 'react';
import { Check, RefreshCcw, AlertTriangle, User, Calendar, Palette, ShieldAlert, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import LegalModal from '../common/LegalModal';
import SEO from '../common/SEO';

const SettingsView = () => {
    const {
        profile, setProfile, resetAllProgress, navigateTo,
        theme, setTheme, notificationsEnabled, requestNotificationPermission, sendNotification
    } = useApp();
    const [name, setName] = useState(profile.name || 'Commander');
    const [birthDate, setBirthDate] = useState(profile.birthDate || '1995-01-01');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [activeLegal, setActiveLegal] = useState(null);

    const handleSave = () => {
        setProfile(prev => ({ ...prev, name, birthDate }));
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8B5CF6', '#06B6D4', '#10B981']
        });
    };

    const handleReset = () => {
        resetAllProgress();
        setShowResetConfirm(false);
        navigateTo('focus');
    };

    return (
        <div className="view active" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <SEO
                title="Account Settings"
                description="Manage your LifeFlow profile, preferences, notifications, and application settings."
            />
            <div className="section-header" style={{ marginBottom: '3rem', borderBottom: '1px solid var(--ui-border-soft)', paddingBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-0.04em' }}>Profile <span className="gradient-text">Settings.</span></h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '1rem', marginTop: '0.4rem' }}>Manage your identity and preferences.</p>
            </div>

            <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '2rem' }}>
                {/* Identity & Life Calibration */}
                <div className="glass-premium p-8">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '2.5rem' }}>
                        <div style={{ background: 'rgba(139, 92, 246, 0.12)', padding: '0.8rem', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                            <User size={20} color="var(--primary)" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)' }}>User Identity</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Personal details</p>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ marginBottom: '0.8rem', display: 'block', fontSize: '0.65rem', fontWeight: 950, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                            NAME
                        </label>
                        <input
                            className="glass"
                            style={{
                                width: '100%',
                                padding: '1.2rem',
                                fontSize: '1rem',
                                color: 'var(--text-main)',
                                borderRadius: '16px',
                                outline: 'none',
                                fontWeight: 900
                            }}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter Name..."
                        />
                    </div>

                    <div className="form-row-responsive" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.2rem', marginBottom: '2.5rem' }}>
                        <div className="form-group">
                            <label style={{ marginBottom: '0.8rem', display: 'block', fontSize: '0.65rem', fontWeight: 950, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                                BIRTHDAY
                            </label>
                            <input
                                type="date"
                                className="glass"
                                style={{
                                    width: '100%',
                                    padding: '1.2rem',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-main)',
                                    borderRadius: '16px',
                                    outline: 'none',
                                    fontWeight: 900
                                }}
                                value={birthDate}
                                onChange={e => setBirthDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ marginBottom: '0.8rem', display: 'block', fontSize: '0.65rem', fontWeight: 950, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                                TARGET AGE
                            </label>
                            <input
                                type="number"
                                className="glass"
                                style={{
                                    width: '100%',
                                    padding: '1.2rem',
                                    fontSize: '0.9rem',
                                    color: 'var(--text-main)',
                                    borderRadius: '16px',
                                    outline: 'none',
                                    fontWeight: 900
                                }}
                                value={profile.expectancy || 85}
                                onChange={e => setProfile(prev => ({ ...prev, expectancy: parseInt(e.target.value) }))}
                            />
                        </div>
                    </div>

                    <button className="btn btn-primary btn-full" style={{ height: '60px', borderRadius: '18px', fontSize: '1rem', fontWeight: 950 }} onClick={handleSave}>
                        <Check size={20} /> Save Changes
                    </button>
                </div>

                {/* Preference Cluster */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-premium p-8">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '2.5rem' }}>
                            <div style={{ background: 'rgba(6, 182, 212, 0.12)', padding: '0.8rem', borderRadius: '16px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                                <Palette size={20} color="var(--secondary)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)' }}>Interface Theme</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Change appearance</p>
                            </div>
                        </div>

                        <div className="theme-toggle-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
                            <button
                                className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-glass'}`}
                                style={{ height: '80px', borderRadius: '20px', flexDirection: 'column', gap: '0.5rem' }}
                                onClick={() => setTheme('light')}
                            >
                                <span style={{ fontSize: '0.9rem', fontWeight: 950 }}>Light Mode</span>
                                <span style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 800 }}>Default White</span>
                            </button>
                            <button
                                className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-glass'}`}
                                style={{ height: '80px', borderRadius: '20px', flexDirection: 'column', gap: '0.5rem' }}
                                onClick={() => setTheme('dark')}
                            >
                                <span style={{ fontSize: '0.9rem', fontWeight: 950 }}>Dark Mode</span>
                                <span style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 800 }}>Clean Black</span>
                            </button>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <label style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', fontWeight: 950, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                                PREMIUM AURAS {(profile.tier === 'Free') && <Crown size={12} color="#F59E0B" />}
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
                                {[
                                    { id: 'aura-emerald', color: '#10B981' },
                                    { id: 'aura-rose', color: '#F43F5E' },
                                    { id: 'aura-indigo', color: '#6366F1' },
                                    { id: 'aura-amber', color: '#F59E0B' }
                                ].map(aura => (
                                    <button
                                        key={aura.id}
                                        onClick={() => {
                                            if (profile.tier === 'Free') {
                                                navigateTo('premium');
                                                return;
                                            }
                                            setTheme(aura.id);
                                        }}
                                        style={{
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: aura.color,
                                            border: theme === aura.id ? '2px solid white' : 'none',
                                            cursor: 'pointer',
                                            opacity: profile.tier === 'Free' ? 0.3 : 1,
                                            position: 'relative'
                                        }}
                                    >
                                        {profile.tier === 'Free' && (
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Crown size={14} color="white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="glass-premium p-8">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '2.5rem' }}>
                            <div style={{ background: 'rgba(6, 182, 212, 0.12)', padding: '0.8rem', borderRadius: '16px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                                <Check size={20} color="var(--primary)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)' }}>Notifications</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Alerts & Telemetry</p>
                            </div>
                        </div>

                        <div className="notification-zone" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ui-bg-low)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--ui-border-soft)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {notificationsEnabled ? <Check size={20} color="var(--success)" /> : <AlertTriangle size={20} color="var(--warning)" />}
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>Push Notifications</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{notificationsEnabled ? 'System alerts active' : 'Notifications disabled'}</div>
                                </div>
                            </div>
                            <button
                                className={`btn ${notificationsEnabled ? 'btn-glass' : 'btn-primary'}`}
                                onClick={() => {
                                    if (!notificationsEnabled) {
                                        requestNotificationPermission().then(granted => {
                                            if (granted) sendNotification('LifeFlow System', 'This is a test notification!');
                                        });
                                    } else {
                                        sendNotification('LifeFlow System', 'This is a test notification!');
                                    }
                                }}
                                style={{ borderRadius: '12px', fontSize: '0.8rem', padding: '0.6rem 1.2rem' }}
                            >
                                {notificationsEnabled ? 'Test Notification' : 'Enable Now'}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button onClick={() => setActiveLegal('privacy')} className="btn btn-glass" style={{ fontSize: '0.8rem', padding: '0.6rem 1.2rem', borderRadius: '12px' }}>
                            Privacy Policy
                        </button>
                        <button onClick={() => setActiveLegal('terms')} className="btn btn-glass" style={{ fontSize: '0.8rem', padding: '0.6rem 1.2rem', borderRadius: '12px' }}>
                            Terms of Service
                        </button>
                        <button onClick={() => setActiveLegal('compliance')} className="btn btn-glass" style={{ fontSize: '0.8rem', padding: '0.6rem 1.2rem', borderRadius: '12px' }}>
                            Compliance
                        </button>
                    </div>
                </div>

                {/* Subscription Management */}
                {profile.tier !== 'Free' && (
                    <div className="glass-premium p-8" style={{ border: '1px solid var(--primary-glow)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '2.5rem' }}>
                            <div style={{ background: 'rgba(139, 92, 246, 0.12)', padding: '0.8rem', borderRadius: '16px', border: '1px solid var(--primary-glow)' }}>
                                <Crown size={20} color="var(--primary)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)' }}>Subscription</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{profile.tier} Plan Active</p>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: '1.6', marginBottom: '2rem' }}>
                            Your subscription is managed via Dodo Payments. You can update your payment method or cancel through the billing portal.
                        </p>
                        <a
                            href="https://app.dodopayments.com/customer/login"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-full"
                            style={{ height: '56px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 950, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            Manage Subscription
                        </a>
                    </div>
                )}

                {/* Danger Protocol */}
                <div className="glass p-8" style={{ borderRadius: '32px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '0.8rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <ShieldAlert size={20} color="var(--danger)" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--danger)' }}>Reset Data</h3>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                        Warning: This will permanently delete all your progress, habits, and task history. This cannot be undone.
                    </p>

                    {!showResetConfirm ? (
                        <button className="btn btn-glass" onClick={() => setShowResetConfirm(true)} style={{ width: '100%', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)', height: '56px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 950 }}>
                            <RefreshCcw size={16} /> Reset Everything
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" onClick={handleReset} style={{ background: 'var(--danger)', flex: 2, height: '56px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 950 }}>
                                Confirm Reset
                            </button>
                            <button className="btn btn-glass" onClick={() => setShowResetConfirm(false)} style={{ flex: 1, height: '56px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 950, border: '1px solid var(--ui-border-soft)' }}>
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {activeLegal && (
                <LegalModal activeTab={activeLegal} onClose={() => setActiveLegal(null)} />
            )}
        </div>
    );
};

export default SettingsView;
