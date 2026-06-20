import React from 'react';
import { Crown, Star, Check, Sparkles, Loader2, Zap, Shield, Globe, Users, Gift, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import SEO from '../common/SEO';

const PremiumView = () => {
    const { user, profile, setTier, navigateTo } = useApp();
    const [loading, setLoading] = React.useState(null);
    const [hovered, setHovered] = React.useState(null);

    const plans = [
        {
            id: 'pdt_0NZpzcLH8Af4NTeIFRXVj',
            name: 'Basic',
            tagline: 'Start your journey',
            price: '$1',
            period: '/month',
            color: '#8B5CF6',
            glow: 'rgba(139,92,246,0.3)',
            emoji: '🌱',
            features: ['All core habit tracking', 'Daily focus sessions', 'Task management', 'Web access', 'Fast support'],
            product_id: 'pdt_0NZpzcLH8Af4NTeIFRXVj'
        },
        {
            id: 'pdt_0NZfwYTl1ybQWYQhYzfVn',
            name: 'Pro',
            tagline: 'Best value for growth',
            price: '$9.99',
            period: '/year',
            color: '#06B6D4',
            glow: 'rgba(6,182,212,0.35)',
            emoji: '⚡',
            features: ['Everything in Basic', 'Full analytics & heatmaps', 'GitHub-style Habits Heatmaps', 'Custom themes', 'Priority updates'],
            popular: true,
            badge: 'SAVE 40%',
            product_id: 'pdt_0NZfwYTl1ybQWYQhYzfVn'
        },
        {
            id: 'pdt_0NZfweHtiqDq1PcVMOYwR',
            name: 'Lifetime',
            tagline: 'Pay once, own it forever',
            price: '$49.99',
            period: 'one-time',
            color: '#F59E0B',
            glow: 'rgba(245,158,11,0.3)',
            emoji: '👑',
            features: ['Lifetime access', 'All future features', 'VIP community', 'Custom branding', 'Dedicated support'],
            badge: 'FOREVER',
            product_id: 'pdt_0NZfweHtiqDq1PcVMOYwR'
        }
    ];

    const handleSubscribe = async (plan) => {
        if (!user) {
            alert('Please login with your Google account first to secure your premium status.');
            return;
        }
        if (!plan.product_id) {
            setTier(plan.name);
            alert(`Mock: ${plan.name} activated!`);
            confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 }, colors: ['#8B5CF6', '#06B6D4', '#F59E0B'] });
            return;
        }
        setLoading(plan.id);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_cart: [{ product_id: plan.product_id, quantity: 1 }],
                    return_url: `${window.location.origin}${window.location.pathname}?payment=success&plan=${plan.name}`,
                    success_url: `${window.location.origin}${window.location.pathname}?payment=success&plan=${plan.name}`,
                    cancel_url: `${window.location.origin}${window.location.pathname}?payment=cancelled`,
                    customer: { email: user?.email || 'customer@example.com', name: user?.name || 'Customer' }
                })
            });
            const data = await response.json();
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                const errorMsg = data.details || data.error || data.message || 'Checkout failed.';
                alert(`Error: ${errorMsg}`);
            }
        } catch (error) {
            alert(`Connection error: ${error.message}`);
        } finally {
            setLoading(null);
        }
    };

    const isCurrentPlan = (planName) => profile.tier === planName;

    const perks = [
        { icon: Zap, label: 'Instant Sync', desc: 'Real-time cloud sync across all your devices' },
        { icon: Shield, label: 'Privacy First', desc: 'Your data is encrypted and never sold' },
        { icon: Globe, label: 'Cross-Platform', desc: 'Works on web, mobile, and desktop' },
        { icon: Gift, label: 'Regular Updates', desc: 'New features added every month' },
    ];

    return (
        <div className="view active" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '6rem' }}>
            <SEO title="Premium Upgrade" description="Unlock powerful LifeFlow premium features." />
            <style>{`
                .plan-card {
                    padding: 2.5rem;
                    border-radius: 32px;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }
                .plan-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.04), transparent);
                    pointer-events: none;
                    border-radius: 32px;
                }
                .plan-card:hover {
                    transform: translateY(-12px);
                }
                .plan-card.popular-plan {
                    background: linear-gradient(145deg, rgba(6,182,212,0.12), rgba(6,182,212,0.03)) !important;
                }
                .plan-feature-item {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                    padding: 0.7rem 0;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    font-size: 0.88rem;
                    color: var(--text-main);
                    font-weight: 600;
                }
                .perk-card {
                    padding: 1.5rem;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.06);
                    background: rgba(255,255,255,0.02);
                    transition: all 0.35s ease;
                }
                .perk-card:hover {
                    background: rgba(6,182,212,0.05);
                    border-color: rgba(6,182,212,0.2);
                    transform: translateY(-4px);
                }
                .trust-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.6rem 1.2rem;
                    border-radius: 100px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: var(--text-dim);
                }
                @keyframes shimmer-gradient {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .shimmer-text {
                    background: linear-gradient(90deg, #06B6D4, #A855F7, #F59E0B, #06B6D4);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer-gradient 4s linear infinite;
                }
            `}</style>

            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: '4rem', paddingTop: '1rem' }}>
                <div className="pop-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', background: 'linear-gradient(90deg, rgba(139,92,246,0.12), rgba(6,182,212,0.12))', padding: '0.6rem 1.4rem', borderRadius: '100px', border: '1px solid rgba(139,92,246,0.25)', marginBottom: '1.8rem' }}>
                    <Crown size={14} color="#F59E0B" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 950, letterSpacing: '0.2em', color: '#F59E0B' }}>PREMIUM TIERS</span>
                </div>
                <h2 className="reveal-down" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 950, marginBottom: '1.2rem', letterSpacing: '-0.05em', lineHeight: 1 }}>
                    Upgrade your{' '}
                    <span className="shimmer-text">Experience.</span>
                </h2>
                <p className="float-up-in stagger-2" style={{ color: 'var(--text-dim)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto', lineHeight: '1.6' }}>
                    Unlock powerful analytics, habits heatmaps, and customization tools to level up your life.
                </p>

                {profile.tier !== 'Free' && (
                    <div className="pop-in stagger-3" style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(16,185,129,0.1)', padding: '0.6rem 1.4rem', borderRadius: '100px', border: '1px solid rgba(16,185,129,0.25)' }}>
                        <Check size={14} color="#10B981" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#10B981' }}>Currently on {profile.tier} Plan</span>
                    </div>
                )}
            </div>

            {/* Plans */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                {plans.map((plan, idx) => {
                    const isCurrent = isCurrentPlan(plan.name);
                    return (
                        <div
                            key={plan.id}
                            className={`plan-card pop-in stagger-${idx + 1} ${plan.popular ? 'popular-plan' : ''}`}
                            style={{
                                border: plan.popular ? `2px solid ${plan.color}50` : isCurrent ? '2px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                background: plan.popular ? undefined : 'rgba(10,10,20,0.6)',
                                boxShadow: hovered === plan.id ? `0 40px 80px ${plan.glow}` : plan.popular ? `0 20px 50px ${plan.glow}` : 'none',
                            }}
                            onMouseEnter={() => setHovered(plan.id)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {/* Popular badge */}
                            {plan.badge && (
                                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: plan.color, color: 'white', padding: '0.35rem 0.9rem', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.1em', boxShadow: `0 4px 16px ${plan.glow}` }}>{plan.badge}</div>
                            )}

                            {/* Emoji + name */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem', lineHeight: 1 }}>{plan.emoji}</div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{plan.tagline}</div>
                                <h3 style={{ fontSize: '2rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>{plan.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginTop: '1rem' }}>
                                    <span style={{ fontSize: '3.5rem', fontWeight: 950, color: plan.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{plan.price}</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 700 }}>{plan.period}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div style={{ marginBottom: '2.5rem', flex: 1 }}>
                                {plan.features.map((f, i) => (
                                    <div key={i} className="plan-feature-item">
                                        <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: `${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Check size={12} color={plan.color} strokeWidth={3} />
                                        </div>
                                        {f}
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <button
                                className={`btn ${plan.popular ? 'btn-primary pulse-glow' : ''} ripple-host`}
                                onClick={() => handleSubscribe(plan)}
                                disabled={loading === plan.id || isCurrent}
                                style={{
                                    width: '100%', height: '58px', borderRadius: '18px',
                                    background: isCurrent ? 'rgba(16,185,129,0.1)' : plan.popular ? plan.color : 'transparent',
                                    border: isCurrent ? '1px solid rgba(16,185,129,0.3)' : plan.popular ? 'none' : `1px solid ${plan.color}60`,
                                    color: isCurrent ? '#10B981' : 'white',
                                    fontSize: '0.95rem', fontWeight: 950,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem',
                                    cursor: isCurrent ? 'default' : loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s',
                                    boxShadow: plan.popular && !isCurrent ? `0 8px 24px ${plan.glow}` : 'none'
                                }}
                            >
                                {loading === plan.id ? <Loader2 size={18} className="animate-spin" /> :
                                 isCurrent ? <><Check size={16} /> Current Plan</> :
                                 <><Sparkles size={17} /> Get Started</>}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Perks section */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 950, marginBottom: '2.5rem', letterSpacing: '-0.03em' }}>
                    Why <span className="gradient-text">LifeFlow Premium?</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
                    {perks.map((p, i) => (
                        <div key={i} className={`perk-card pop-in stagger-${i + 1}`}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(6,182,212,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 0 20px rgba(6,182,212,0.15)' }}>
                                <p.icon size={20} />
                            </div>
                            <div style={{ fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.4rem', fontSize: '0.95rem' }}>{p.label}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{p.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                {['🔒 256-bit Encrypted', '🌍 GDPR Compliant', '⚡ Instant Activation', '💸 30-Day Refund'].map((b, i) => (
                    <div key={i} className="trust-badge">{b}</div>
                ))}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default PremiumView;
