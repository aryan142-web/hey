import React, { useState, useMemo } from 'react';
import { Plus, Repeat, Filter, Search, Award, Flame, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { categoryIcons } from '../../utils/constants';
import HabitNode from '../common/HabitNode';
import TimeNode from '../common/TimeNode';
import SEO from '../common/SEO';

const HabitsView = () => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const { items, setItems, updateTrackerValue, openModal, profile, subTheme } = useApp();
    const routines = items.filter(item => item.type === 'tracker' || item.type === 'time');
    const isHuman = subTheme === 'human';

    // State for filtering, searching, sorting
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default'); // 'default', 'streak', 'progress', 'name'

    // Compute Metrics Stats
    const totalHabits = routines.length;
    const completedHabits = routines.filter(item => item.completed).length;
    const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    const totalStreak = routines.reduce((sum, item) => sum + (item.streak || 0), 0);

    // Filter and Sort Logic
    const filteredRoutines = useMemo(() => {
        let list = [...routines];
        
        // Filter by category
        if (activeCategory !== 'All') {
            list = list.filter(item => item.category?.toLowerCase() === activeCategory.toLowerCase());
        }
        
        // Filter by search query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            list = list.filter(item => item.name?.toLowerCase().includes(query));
        }
        
        // Sort
        if (sortBy === 'streak') {
            list.sort((a, b) => (b.streak || 0) - (a.streak || 0));
        } else if (sortBy === 'progress') {
            const getPct = (item) => (item.value / item.target) * 100;
            list.sort((a, b) => getPct(b) - getPct(a));
        } else if (sortBy === 'name') {
            list.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        return list;
    }, [routines, activeCategory, searchQuery, sortBy]);

    return (
        <div className="view active" style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '4rem' }}>
            <SEO
                title="Daily Habits & Routines"
                description="Track your daily habits, build consistency, and optimize your routines with LifeFlow. Monitor streaks, set targets, and build lasting behavioral patterns."
                keywords="habit tracker, daily habits, habit streaks, routine builder, consistency tracker, behavior tracking, personal habits, LifeFlow habits"
            />
            
            {/* Header section */}
            <div className="section-header" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                borderBottom: '1px solid var(--ui-border-soft)',
                paddingBottom: '1.8rem',
                marginBottom: '2.5rem'
            }}>
                <div className="reveal-down" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', width: '100%' }}>
                    <div>
                        <h2 style={{ fontSize: 'var(--mobile-h2, 2.5rem)', fontWeight: 950, letterSpacing: '-0.04em' }}>
                            {getGreeting()}, <span className={isHuman ? 'human-underline' : 'gradient-text text-shimmer'} style={isHuman ? { color: 'var(--primary)' } : {}}>{profile.name}.</span>
                        </h2>
                        <p className="float-up-in stagger-2" style={{ color: 'var(--text-dim)', fontSize: '1rem', marginTop: '0.5rem' }}>
                            {isHuman 
                                ? "Let's check in on our habits today. Slow, steady progress." 
                                : "The consistency dashboard for optimal routine execution."}
                        </p>
                    </div>

                    <button className="btn btn-primary ripple-host float-up-in stagger-3" onClick={() => openModal('tracker')} style={{ borderRadius: '16px', padding: '0.8rem 1.6rem', fontSize: '0.95rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={18} />
                        <span>{isHuman ? '✏️ Add Habit' : 'Add Habit'}</span>
                    </button>
                </div>
            </div>

            {/* Dashboard consistency metrics bar */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2.5rem'
            }}>
                {/* Completion rate card */}
                <div className="glass-premium" style={{
                    padding: '1.5rem',
                    borderRadius: isHuman ? '255px 15px 225px 15px/15px 225px 15px 255px' : '20px',
                    border: isHuman ? '2.5px solid var(--glass-border)' : '1px solid var(--ui-border-soft)',
                    background: isHuman ? 'var(--bg-card)' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(6, 182, 212, 0.05))',
                    boxShadow: isHuman ? '4px 6px 1px rgba(0,0,0,0.04)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {isHuman && <div className="paperclip-overlay" style={{ top: '-10px', right: '15px' }} />}
                    <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: isHuman ? '50%' : '14px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: 'var(--success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isHuman ? '2px dashed var(--glass-border)' : 'none'
                    }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consistency Rate</span>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.1 }}>
                            {completionRate}%
                        </h3>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                            {completedHabits} of {totalHabits} completed today
                        </p>
                    </div>
                </div>

                {/* Total Streaks card */}
                <div className="glass-premium" style={{
                    padding: '1.5rem',
                    borderRadius: isHuman ? '255px 15px 225px 15px/15px 225px 15px 255px' : '20px',
                    border: isHuman ? '2.5px solid var(--glass-border)' : '1px solid var(--ui-border-soft)',
                    background: isHuman ? 'var(--bg-card)' : 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(239, 68, 68, 0.05))',
                    boxShadow: isHuman ? '4px 6px 1px rgba(0,0,0,0.04)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {isHuman && <div className="paperclip-overlay" style={{ top: '-10px', right: '15px' }} />}
                    <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: isHuman ? '50%' : '14px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        color: '#F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isHuman ? '2px dashed var(--glass-border)' : 'none'
                    }}>
                        <Flame size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streak Power</span>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.1 }}>
                            {totalStreak} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 700 }}>Days</span>
                        </h3>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                            Keep the momentum going!
                        </p>
                    </div>
                </div>

                {/* Level / XP card */}
                <div className="glass-premium" style={{
                    padding: '1.5rem',
                    borderRadius: isHuman ? '255px 15px 225px 15px/15px 225px 15px 255px' : '20px',
                    border: isHuman ? '2.5px solid var(--glass-border)' : '1px solid var(--ui-border-soft)',
                    background: isHuman ? 'var(--bg-card)' : 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(59, 130, 246, 0.05))',
                    boxShadow: isHuman ? '4px 6px 1px rgba(0,0,0,0.04)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {isHuman && <div className="paperclip-overlay" style={{ top: '-10px', right: '15px' }} />}
                    <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: isHuman ? '50%' : '14px',
                        background: 'rgba(6, 182, 212, 0.12)',
                        color: '#06b6d4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isHuman ? '2px dashed var(--glass-border)' : 'none'
                    }}>
                        <Award size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Character Growth</span>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.1 }}>
                            Lvl {profile.level}
                        </h3>
                        <div style={{ height: '4px', background: 'var(--ui-bg-low)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                            <div style={{ width: `${profile.xp % 100}%`, height: '100%', background: 'var(--primary)' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and search Command Center bar */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem',
                marginBottom: '2.5rem',
                padding: '1.2rem',
                background: isHuman ? 'var(--bg-card)' : 'rgba(255, 255, 255, 0.02)',
                border: isHuman ? '2.5px solid var(--glass-border)' : '1px solid var(--ui-border-soft)',
                borderRadius: isHuman ? '20px 255px 15px 225px/15px 20px 225px 255px' : '20px',
                boxShadow: isHuman ? '4px 6px 1px rgba(0,0,0,0.03)' : 'none',
            }}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    {/* Search Input */}
                    <div style={{
                        position: 'relative',
                        flex: '1 1 300px',
                        maxWidth: '500px'
                    }}>
                        <Search size={16} color="var(--text-muted)" style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none'
                        }} />
                        <input
                            type="text"
                            placeholder="Search habits by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem 0.8rem 2.8rem',
                                borderRadius: isHuman ? '95px 12px 110px 15px/15px 90px 12px 110px' : '14px',
                                background: isHuman ? 'var(--bg-dark)' : 'rgba(255, 255, 255, 0.03)',
                                border: isHuman ? '2.5px solid var(--glass-border)' : '1px solid var(--ui-border-soft)',
                                color: 'var(--text-main)',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>

                    {/* Sorting selector */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem'
                    }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>SORT BY</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: '0.7rem 1.8rem 0.7rem 1rem',
                                borderRadius: isHuman ? '95px 12px 110px 15px/15px 90px 12px 110px' : '14px',
                                background: isHuman ? 'var(--bg-dark)' : 'rgba(255,255,255,0.03)',
                                border: isHuman ? '2.5px solid var(--glass-border)' : '1px solid var(--ui-border-soft)',
                                color: 'var(--text-main)',
                                fontSize: '0.85rem',
                                fontWeight: 750,
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="default">Create Date</option>
                            <option value="streak">Flame Streak</option>
                            <option value="progress">Daily Completion</option>
                            <option value="name">Habit Name</option>
                        </select>
                    </div>
                </div>

                {/* Horizontal Category scroll */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    {['All', 'Health', 'Mind', 'Productivity', 'Finance', 'Lifestyle', 'Wellness', 'Focus'].map((catName) => {
                        const IconComponent = catName === 'All' ? Repeat : (categoryIcons[catName.toLowerCase()] || Repeat);
                        const isSelected = activeCategory === catName;
                        
                        // Count items in this category
                        const count = catName === 'All' 
                            ? routines.length 
                            : routines.filter(i => i.category?.toLowerCase() === catName.toLowerCase()).length;

                        return (
                            <button
                                key={catName}
                                onClick={() => setActiveCategory(catName)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '0.5rem 1rem',
                                    borderRadius: isHuman 
                                        ? '80px 10px 90px 10px/10px 80px 10px 90px' 
                                        : '100px',
                                    background: isSelected 
                                        ? (isHuman ? 'var(--primary)' : 'rgba(6, 182, 212, 0.15)') 
                                        : (isHuman ? 'var(--bg-dark)' : 'rgba(255,255,255,0.02)'),
                                    color: isSelected 
                                        ? (isHuman ? '#fff' : 'var(--primary)') 
                                        : 'var(--text-dim)',
                                    border: isHuman 
                                        ? `2px solid ${isSelected ? 'var(--text-main)' : 'var(--glass-border)'}` 
                                        : `1px solid ${isSelected ? 'rgba(6, 182, 212, 0.3)' : 'var(--ui-border-soft)'}`,
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.25s ease'
                                }}
                            >
                                <IconComponent size={13} />
                                <span>{catName}</span>
                                <span style={{
                                    fontSize: '0.7rem',
                                    opacity: 0.6,
                                    background: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                                    padding: '1px 5px',
                                    borderRadius: '6px',
                                    marginLeft: '2px'
                                }}>{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Habits Grid listing */}
            {filteredRoutines.length === 0 ? (
                <div className="glass-premium pop-in habit-card" style={{ textAlign: 'center', padding: '6rem 2rem', borderRadius: isHuman ? '255px 15px 225px 15px/15px 225px 15px 255px' : '24px' }}>
                    <div className="empty-icon-float" style={{ width: '80px', height: '80px', background: 'var(--primary-glow)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem' }}>
                        <Repeat size={40} color="var(--primary)" />
                    </div>
                    <h3 className="float-up-in stagger-2" style={{ fontSize: '1.8rem', fontWeight: 950, marginBottom: '1rem' }}>No Habits Found.</h3>
                    <p className="float-up-in stagger-3" style={{ color: 'var(--text-dim)', marginBottom: '3rem' }}>
                        {searchQuery || activeCategory !== 'All' 
                            ? "Try relaxing your search or filter settings." 
                            : "Start building your daily routines now."}
                    </p>
                    <button className="btn btn-primary ripple-host float-up-in stagger-4" onClick={() => openModal('tracker')} style={{ padding: '1rem 3rem', borderRadius: '100px' }}>
                        {searchQuery || activeCategory !== 'All' ? "Clear Search/Filters" : "Create First Habit"}
                    </button>
                </div>
            ) : (
                <div className="habits-grid">
                    {filteredRoutines.map((item, idx) => (
                        item.type === 'time' ? (
                            <div 
                                key={item.id} 
                                className={`pop-in stagger-${Math.min(idx + 1, 8)}`}
                                style={isHuman ? {
                                    transform: `rotate(${[-0.8, 1.0, -1.2, 0.6, -0.5, 0.8][idx % 6]}deg)`,
                                    transition: 'transform 0.3s ease'
                                } : {}}
                            >
                                <TimeNode
                                    item={item}
                                    onUpdateValue={updateTrackerValue}
                                    onDelete={(id) => setItems(prev => prev.filter(i => i.id !== id))}
                                />
                            </div>
                        ) : (
                            <div 
                                key={item.id} 
                                className={`pop-in stagger-${Math.min(idx + 1, 8)}`}
                                style={isHuman ? {
                                    transform: `rotate(${[-1.2, 0.6, -0.8, 1.0, -0.6, 1.2][idx % 6]}deg)`,
                                    transition: 'transform 0.3s ease'
                                } : {}}
                            >
                                <HabitNode
                                    item={item}
                                    onUpdateValue={updateTrackerValue}
                                    onDelete={(id) => setItems(prev => prev.filter(i => i.id !== id))}
                                />
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

export default HabitsView;
