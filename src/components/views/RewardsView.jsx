import React, { useMemo } from 'react';
import { Gift, Award, Target, Zap, CheckCircle2, Flame, Crown, Lock, Trophy, Star, Shield, Rocket, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const RewardsView = () => {
    const {
        profile,
        items,
        claimedRewards,
        lastDailyReward,
        claimDailyReward,
        claimAchievement
    } = useApp();

    const today = new Date().toISOString().split('T')[0];
    const isDailyClaimed = lastDailyReward === today;

    const completedTasksCount = useMemo(() => {
        return items.filter(i => i.type === 'task' && i.completed).length;
    }, [items]);

    const totalStreak = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.streak || 0), 0);
    }, [items]);

    const achievements = [
        {
            id: 'first_steps',
            title: 'First Steps',
            description: 'Complete your first task',
            icon: CheckCircle2,
            color: '#10B981',
            requirement: completedTasksCount >= 1,
            reward: 50
        },
        {
            id: 'streak_master',
            title: 'Streak Master',
            description: 'Achieve a 7-day total streak',
            icon: Flame,
            color: '#F59E0B',
            requirement: totalStreak >= 7,
            reward: 200
        },
        {
            id: 'rising_star',
            title: 'Rising Star',
            description: 'Reach Level 5',
            icon: Star,
            color: '#22D3EE',
            requirement: profile.level >= 5,
            reward: 300
        },
        {
            id: 'task_warrior',
            title: 'Task Warrior',
            description: 'Complete 10 tasks',
            icon: Shield,
            color: '#06B6D4',
            requirement: completedTasksCount >= 10,
            reward: 500
        },
        {
            id: 'xp_collector',
            title: 'XP Collector',
            description: 'Earn 1000 XP',
            icon: Zap,
            color: '#EC4899',
            requirement: profile.xp >= 1000,
            reward: 100
        },
        {
            id: 'legend',
            title: 'Legend',
            description: 'Reach Level 10',
            icon: Crown,
            color: '#F59E0B',
            requirement: profile.level >= 10,
            reward: 1000
        }
    ];

    const milestones = [
        { level: 1, title: 'Novice', reward: 'Basic Badge', color: '#94A3B8' },
        { level: 3, title: 'Practitioner', reward: 'Bronze Badge', color: '#CD7F32' },
        { level: 5, title: 'Dedicated', reward: 'Silver Badge', color: '#C0C0C0' },
        { level: 7, title: 'Master', reward: 'Gold Badge', color: '#FFD700' },
        { level: 10, title: 'Legend', reward: 'Platinum Badge', color: '#E5E4E2' }
    ];

    return (
        <div className="view active" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div className="section-header reveal-down" style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-0.04em' }}>Your <span className="gradient-text">Rewards.</span></h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '1rem', marginTop: '0.4rem' }}>Unlock achievements and claim daily bonuses.</p>
            </div>

            {/* DAILY REWARD CARD */}
            <div className="glass-premium" style={{
                padding: '2.5rem',
                borderRadius: '32px',
                marginBottom: '3rem',
                background: isDailyClaimed ? 'var(--ui-bg-low)' : 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
                border: isDailyClaimed ? '1px solid var(--glass-border)' : '1px solid var(--primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '24px',
                        background: 'var(--bg-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isDailyClaimed ? 'none' : '0 0 30px var(--primary-glow)'
                    }}>
                        <Gift size={40} color={isDailyClaimed ? 'var(--text-muted)' : 'var(--primary)'} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Daily Bonus</h3>
                        <p style={{ color: 'var(--text-dim)' }}>Claim your daily dose of 50 XP to level up faster.</p>
                    </div>
                </div>
                <button
                    className={`btn ${isDailyClaimed ? 'btn-glass' : 'btn-primary-premium'}`}
                    disabled={isDailyClaimed}
                    onClick={claimDailyReward}
                    style={{ minWidth: '200px' }}
                >
                    {isDailyClaimed ? (
                        <><CheckCircle2 size={20} /> Claimed Today</>
                    ) : (
                        <><Zap size={20} /> Claim +50 XP</>
                    )}
                </button>
            </div>

            {/* ACHIEVEMENTS GRID */}
            <div style={{ marginBottom: '4rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Trophy size={20} color="var(--warning)" /> Achievements
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
                    {achievements.map(ach => {
                        const isClaimed = claimedRewards.includes(ach.id);
                        const canClaim = ach.requirement && !isClaimed;

                        return (
                            <div key={ach.id} className="glass-premium" style={{
                                padding: '1.8rem',
                                borderRadius: '24px',
                                border: `1px solid ${isClaimed ? ach.color + '40' : canClaim ? ach.color : 'var(--glass-border)'}`,
                                background: isClaimed ? `${ach.color}05` : 'var(--bg-card)',
                                position: 'relative',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        background: `${ach.color}15`,
                                        color: ach.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: `1px solid ${ach.color}30`
                                    }}>
                                        <ach.icon size={24} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{ach.title}</h4>
                                        <div style={{ fontSize: '0.7rem', color: ach.color, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            +{ach.reward} XP REWARD
                                        </div>
                                    </div>
                                    {isClaimed && <div style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: ach.color, color: 'white', fontSize: '0.6rem', fontWeight: 950 }}>CLAIMED</div>}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.5rem', lineHeight: '1.6' }}>{ach.description}</p>

                                {isClaimed ? (
                                    <div style={{ height: '44px', display: 'flex', alignItems: 'center', gap: '0.6rem', color: ach.color, fontWeight: 800, fontSize: '0.85rem' }}>
                                        <CheckCircle2 size={16} /> Completed
                                    </div>
                                ) : canClaim ? (
                                    <button
                                        className="btn btn-full"
                                        onClick={() => claimAchievement(ach.id, ach.reward)}
                                        style={{ background: ach.color, color: 'white', fontWeight: 900, borderRadius: '12px', height: '44px' }}
                                    >
                                        Claim Reward
                                    </button>
                                ) : (
                                    <div style={{ height: '44px', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.85rem' }}>
                                        <Lock size={16} /> Locked
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* STATS & MILESTONES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '2rem' }}>
                <div className="glass-premium" style={{ padding: '2.5rem', borderRadius: '32px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <Layers size={20} color="var(--primary)" /> Progression
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {milestones.map(m => {
                            const isReached = profile.level >= m.level;
                            return (
                                <div key={m.level} style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: `2px solid ${isReached ? m.color : 'var(--ui-border-soft)'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isReached ? m.color : 'var(--text-muted)',
                                        fontWeight: 950,
                                        fontSize: '0.8rem',
                                        background: isReached ? `${m.color}15` : 'transparent'
                                    }}>
                                        {isReached ? <CheckCircle2 size={18} /> : m.level}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, color: isReached ? 'var(--text-main)' : 'var(--text-dim)' }}>{m.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.reward}</div>
                                    </div>
                                    {!isReached && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>LVL {m.level}</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass-premium" style={{ padding: '2.5rem', borderRadius: '32px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <Zap size={20} color="var(--primary)" /> Performance
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--primary)', marginBottom: '0.5rem' }}>{profile.level}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Level</div>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: '#F59E0B', marginBottom: '0.5rem' }}>{totalStreak}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Streak</div>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: '#06B6D4', marginBottom: '0.5rem' }}>{completedTasksCount}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Daily Tasks</div>
                        </div>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: '#EC4899', marginBottom: '0.5rem' }}>{profile.xp}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lifetime XP</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RewardsView;
