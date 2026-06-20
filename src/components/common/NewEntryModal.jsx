import React, { useState } from 'react';
import { X, ListChecks, Repeat, Clock, Crown, Sparkles } from 'lucide-react';
import { categoryIcons, premiumIcons } from '../../utils/constants';
import { useApp } from '../../context/AppContext';

const NewEntryModal = ({ isOpen, onClose, onAdd }) => {
    const { modalType, profile, navigateTo } = useApp();
    const isPremium = profile.tier !== 'Free';
    const [name, setName] = useState('');
    const [category, setCategory] = useState('health');
    const [type, setType] = useState('tracker');
    const [target, setTarget] = useState('');
    const [color, setColor] = useState('#06B6D4');

    const nameRef = React.useRef(null);

    React.useEffect(() => {
        if (isOpen) {
            // Default to 'tracker' if it's 'any' or 'tracker', otherwise use the modalType (task)
            const defaultType = (modalType === 'any' || modalType === 'tracker') ? 'tracker' : modalType;
            setType(defaultType);
            setName('');
            setTarget('');
            // Auto-focus the input for easy creation
            setTimeout(() => nameRef.current?.focus(), 100);
        }
    }, [isOpen, modalType]);

    if (!isOpen) return null;

    const colors = [
        { name: 'Purple', value: '#A855F7' },
        { name: 'Blue', value: '#3B82F6' },
        { name: 'Cyan', value: '#06B6D4' },
        { name: 'Emerald', value: '#10B981' },
        { name: 'Amber', value: '#F59E0B' },
        { name: 'Rose', value: '#F43F5E' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            name,
            category: category.charAt(0).toUpperCase() + category.slice(1),
            type,
            target: Number(target) || (type === 'tracker' || type === 'time' ? 1 : 0),
            unit: type === 'time' ? 'minutes' : 'units',
            color
        });
    };

    const handleCategoryClick = (key) => {
        setCategory(key);
    };

    const isTask = type === 'task';

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999, backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.6)' }}>
            <div className="modal glass-premium modal-spring-active" onClick={e => e.stopPropagation()} style={{
                maxWidth: '400px',
                width: '90%',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: '1.5rem',
                borderRadius: '24px',
                border: '1px solid var(--glass-border)',
                boxShadow: `0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px ${color}20`
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 950, letterSpacing: '-0.03em' }}>
                            New <span style={{ color: color }}>{type === 'task' ? 'Task' : 'Habit'}.</span>
                        </h2>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.2rem', fontWeight: 600 }}>Configure your new daily {type === 'task' ? 'objective' : 'routine'}.</p>
                    </div>
                    <button className="btn-close" onClick={onClose} style={{
                        background: 'var(--ui-bg-low)',
                        border: '1px solid var(--ui-border-soft)',
                        borderRadius: '10px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}>
                        <X size={20} color="var(--text-dim)" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.55rem', fontWeight: 950, marginBottom: '0.4rem', letterSpacing: '0.15em' }}>TITLE</label>
                        <input
                            ref={nameRef}
                            className="glass-input-premium"
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                color: 'var(--text-main)',
                                borderRadius: '16px',
                                border: '1px solid var(--ui-border-soft)',
                                background: 'rgba(255,255,255,0.03)',
                                outline: 'none',
                                fontWeight: 700,
                                fontSize: '1rem',
                                transition: 'all 0.3s'
                            }}
                            placeholder={isTask ? "What needs to be done?" : "What habit are you building?"}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.55rem', fontWeight: 950, marginBottom: '0.5rem', letterSpacing: '0.15em' }}>ICON / CATEGORY</label>
                        <div className="options-scroll-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '16px' }}>
                            {Object.entries({ ...categoryIcons, ...premiumIcons }).map(([key, Icon]) => {
                                const isLocked = premiumIcons[key] && !isPremium;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleCategoryClick(key)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            padding: '0.6rem 0.4rem',
                                            borderRadius: '12px',
                                            background: category === key ? color : 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${category === key ? color : 'var(--ui-border-soft)'}`,
                                            color: category === key ? '#050505' : 'var(--text-dim)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Icon size={18} style={{ opacity: (isLocked && category !== key) ? 0.3 : 1 }} strokeWidth={category === key ? 3 : 2} />
                                        <span style={{ fontSize: '0.5rem', fontWeight: 900, textTransform: 'lowercase', letterSpacing: '0.05em', opacity: (isLocked && category !== key) ? 0.3 : 1 }}>{key}</span>
                                        {(isLocked && category !== key) && (
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                                <Crown size={12} color="#F59E0B" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {(modalType === 'any' || modalType === 'tracker') && (
                            <div className="form-group">
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.55rem', fontWeight: 950, marginBottom: '0.5rem', letterSpacing: '0.15em' }}>SELECT TYPE</label>
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${modalType === 'any' ? 3 : 2}, 1fr)`, gap: '0.6rem' }}>
                                    {[
                                        { id: 'task', label: 'Task', icon: ListChecks, hidden: modalType === 'tracker' },
                                        { id: 'tracker', label: 'Habit', icon: Repeat },
                                        { id: 'time', label: 'Duration', icon: Clock }
                                    ].filter(t => !t.hidden).map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => {
                                                setType(t.id);
                                            }}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                padding: '0.8rem 0.4rem',
                                                borderRadius: '14px',
                                                background: type === t.id ? color : 'rgba(255,255,255,0.05)',
                                                border: `1px solid ${type === t.id ? color : 'var(--ui-border-soft)'}`,
                                                color: type === t.id ? '#050505' : 'var(--text-dim)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                cursor: 'pointer',
                                                position: 'relative'
                                            }}
                                        >
                                            <t.icon size={18} strokeWidth={type === t.id ? 3 : 2} />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                <span style={{ fontSize: '0.55rem', fontWeight: 800 }}>{t.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isTask && (
                            <div className="form-group">
                                {type === 'time' ? (
                                    <>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                                                SELECT DURATION (MINS)
                                            </span>
                                            <span style={{ fontSize: '1rem', fontWeight: 950, color: color }}>{target || 0}m</span>
                                        </label>
                                        <div className="duration-timeline-selector" style={{ position: 'relative', padding: '0.5rem 0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', opacity: 0.8 }}>
                                                {[0, 60, 120, 240, 480].map(m => (
                                                    <span key={m} style={{ fontSize: '0.55rem', fontWeight: 950, color: 'var(--text-dim)' }}>{m}m</span>
                                                ))}
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="480"
                                                step="5"
                                                value={target || 0}
                                                onChange={e => setTarget(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    height: '6px',
                                                    WebkitAppearance: 'none',
                                                    background: 'var(--ui-bg-low)',
                                                    borderRadius: '10px',
                                                    outline: 'none',
                                                    accentColor: color,
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.55rem', fontWeight: 950, marginBottom: '0.5rem', letterSpacing: '0.15em' }}>
                                            TARGET COUNT
                                        </label>
                                        <input
                                            type="number"
                                            className="glass-input-premium"
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                color: 'var(--text-main)',
                                                borderRadius: '12px',
                                                border: '1px solid var(--ui-border-soft)',
                                                background: 'rgba(255,255,255,0.03)',
                                                outline: 'none',
                                                fontWeight: 800,
                                                fontSize: '0.8rem',
                                                transition: 'all 0.3s'
                                            }}
                                            placeholder="Enter daily target (e.g., 10, 50, 100)"
                                            value={target}
                                            onChange={e => setTarget(e.target.value)}
                                            required
                                        />
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.55rem', fontWeight: 950, marginBottom: '0.5rem', letterSpacing: '0.15em' }}>ACCENT COLOR</label>
                        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                            {colors.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: c.value,
                                        border: color === c.value ? '2px solid white' : 'none',
                                        cursor: 'pointer',
                                        boxShadow: color === c.value ? `0 0 10px ${c.value}80` : 'none',
                                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        transform: color === c.value ? 'scale(1.2)' : 'scale(1)'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button type="submit" className="btn-primary-premium" style={{
                            flex: 1,
                            height: '44px',
                            borderRadius: '14px',
                            background: color,
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: 950,
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: `0 8px 20px ${color}40`,
                            transition: 'all 0.3s'
                        }}>
                            {type === 'task' ? 'Start Task' : type === 'time' ? 'Set Duration' : 'Initialize Habit'}
                        </button>
                    </div>
                </form>

                <style>{`
                    @keyframes fade-in-overlay {
                        from { opacity: 0; backdrop-filter: blur(0px); }
                        to { opacity: 1; backdrop-filter: blur(12px); }
                    }
                    @keyframes spring-pop-modal {
                        0% { transform: scale(0.85) translateY(30px); opacity: 0; }
                        65% { transform: scale(1.03) translateY(-4px); opacity: 0.95; }
                        85% { transform: scale(0.98) translateY(1px); }
                        100% { transform: scale(1) translateY(0); opacity: 1; }
                    }
                    .modal-overlay {
                        animation: fade-in-overlay 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
                    }
                    .modal-spring-active {
                        animation: spring-pop-modal 0.48s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                        transform-origin: center bottom;
                    }
                    .glass-input-premium:focus {
                        border-color: ${color} !important;
                        background: rgba(255,255,255,0.06) !important;
                        box-shadow: 0 0 0 4px ${color}15;
                    }
                    .options-scroll-section::-webkit-scrollbar, .modal::-webkit-scrollbar {
                        width: 4px;
                    }
                    .options-scroll-section::-webkit-scrollbar-track, .modal::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .options-scroll-section::-webkit-scrollbar-thumb, .modal::-webkit-scrollbar-thumb {
                        background: ${color};
                        border-radius: 4px;
                    }
                    .btn-primary-premium:hover {
                        transform: translateY(-4px);
                        filter: brightness(1.1);
                        box-shadow: 0 15px 40px ${color}60;
                    }
                    .btn-primary-premium:active {
                        transform: translateY(0);
                    }
                    .btn-close:hover {
                        background: var(--ui-border-soft) !important;
                        transform: rotate(90deg);
                    }
                `}</style>
            </div>
        </div>
    );
};

export default NewEntryModal;
