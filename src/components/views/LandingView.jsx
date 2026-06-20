import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Clock, Zap, Layers, CheckCircle2, Shield, Rocket, Activity, ChevronRight, Target, Edit, Heart, Coffee, Star, Sparkles } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useApp } from '../../context/AppContext';
import LegalModal from '../common/LegalModal';
import SEO from '../common/SEO';

// ─── Scroll Reveal Hook ────────────────────────────────────────────────────────
const useScrollReveal = (threshold = 0.12) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setVisible(true);
        }, { threshold, rootMargin: '0px 0px -40px 0px' });
        if (ref.current) observer.observe(ref.current);
        return () => { if (ref.current) observer.unobserve(ref.current); };
    }, [threshold]);
    return [ref, visible];
};

// ─── Count-Up Hook ─────────────────────────────────────────────────────────────
const useCountUp = (target, duration = 1800, shouldStart = false) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!shouldStart) return;
        let start = null;
        const numeric = parseFloat(String(target).replace(/[^0-9.]/g, ''));
        const step = (ts) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.round(eased * numeric));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(numeric);
        };
        requestAnimationFrame(step);
    }, [target, duration, shouldStart]);
    return count;
};

// ─── Animated Stat ─────────────────────────────────────────────────────────────
const AnimatedStat = ({ value, label, suffix = '', started }) => {
    const numeric = useCountUp(value, 1600, started);
    const display = value >= 1000 ? `${(numeric / 1000).toFixed(numeric >= 1000 ? 0 : 1)}k` : numeric;
    return (
        <div style={{ textAlign: 'center', padding: '1.5rem 2rem' }}>
            <div style={{
                fontSize: 'clamp(2.4rem, 4vw, 3.2rem)', fontWeight: 900, lineHeight: 1,
                color: 'var(--primary)', fontFamily: 'var(--font-heading)',
                filter: 'drop-shadow(0 0 12px rgba(var(--primary-rgb),0.4))'
            }}>
                {display}{suffix}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 600 }}>
                {label}
            </div>
        </div>
    );
};

// ─── Floating Particle ─────────────────────────────────────────────────────────
const Particle = ({ emoji, style }) => (
    <div className="lp-particle" style={{ position: 'absolute', fontSize: '1.4rem', pointerEvents: 'none', userSelect: 'none', ...style }}>
        {emoji}
    </div>
);

// ─── SVG Scribble Underline ────────────────────────────────────────────────────
const ScribbleUnderline = ({ visible }) => (
    <svg viewBox="0 0 340 14" fill="none" style={{
        width: '340px', maxWidth: '90%', display: 'block',
        margin: '4px auto 0', overflow: 'visible'
    }}>
        <path
            d="M4,8 Q50,3 100,9 T200,7 T300,10 T336,6"
            stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" fill="none"
            style={{
                strokeDasharray: 400,
                strokeDashoffset: visible ? 0 : 400,
                transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1) 0.3s'
            }}
        />
    </svg>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
const LandingView = () => {
    const { handleLoginSuccess, subTheme, toggleSubTheme, setSubTheme } = useApp();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('signin');
    const [scrolled, setScrolled] = useState(false);
    const [activeLegal, setActiveLegal] = useState(null);
    const [heroEntered, setHeroEntered] = useState(false);

    // Always start the landing page in pi+ mode
    useEffect(() => {
        setSubTheme('human');
    }, [setSubTheme]);

    // Cursor glow tracking
    const glowRef = useRef(null);
    const heroRef = useRef(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const rafId = useRef(null);

    // Draggable stickers
    const [stickers, setStickers] = useState([
        { id: 1, emoji: '☕', x: 85, y: 330, rotate: -12, entered: false },
        { id: 2, emoji: '⚡', x: 270, y: 160, rotate: 15, entered: false },
        { id: 3, emoji: '💡', x: 750, y: 490, rotate: -5, entered: false },
    ]);
    const [isStickerDrawerOpen, setIsStickerDrawerOpen] = useState(false);

    // Section reveal refs
    const [statsRef, statsVisible] = useScrollReveal(0.15);
    const [engRef, engVisible] = useScrollReveal(0.1);
    const [gridRef, gridVisible] = useScrollReveal(0.08);
    const [testRef, testVisible] = useScrollReveal(0.1);
    const [ctaRef, ctaVisible] = useScrollReveal(0.15);

    // ── Hero entrance ───────────────────────────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => setHeroEntered(true), 100);
        return () => clearTimeout(t);
    }, []);

    // Sticker pop-in stagger
    useEffect(() => {
        stickers.forEach((s, i) => {
            setTimeout(() => {
                setStickers(prev => prev.map(st => st.id === s.id ? { ...st, entered: true } : st));
            }, 800 + i * 220);
        });
    }, []);

    // ── Cursor tracking glow ────────────────────────────────────────────────────
    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;

        const handleMove = (e) => {
            const rect = hero.getBoundingClientRect();
            mousePos.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const animateGlow = () => {
            if (glowRef.current) {
                const { x, y } = mousePos.current;
                glowRef.current.style.transform = `translate(${x - 160}px, ${y - 160}px)`;
            }
            rafId.current = requestAnimationFrame(animateGlow);
        };

        hero.addEventListener('mousemove', handleMove, { passive: true });
        rafId.current = requestAnimationFrame(animateGlow);
        return () => {
            hero.removeEventListener('mousemove', handleMove);
            cancelAnimationFrame(rafId.current);
        };
    }, []);

    // ── Scroll ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ── Sticker drag ────────────────────────────────────────────────────────────
    const handleStickerDragStart = (e, id) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = (e.clientX ?? e.touches?.[0].clientX) - rect.left;
        const cy = (e.clientY ?? e.touches?.[0].clientY) - rect.top;

        const move = (me) => {
            const mx = me.clientX ?? me.touches?.[0].clientX;
            const my = me.clientY ?? me.touches?.[0].clientY;
            setStickers(p => p.map(s => s.id === id ? { ...s, x: mx - cx, y: my - cy } : s));
        };
        const up = () => {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', up);
        };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
        document.addEventListener('touchmove', move, { passive: false });
        document.addEventListener('touchend', up);
    };

    const addSticker = (emoji) => {
        const newId = Date.now();
        setStickers(p => [...p, {
            id: newId, emoji,
            x: window.innerWidth / 2 - 20,
            y: window.innerHeight / 2 - 20,
            rotate: Math.random() * 30 - 15,
            entered: false
        }]);
        setIsStickerDrawerOpen(false);
        setTimeout(() => setStickers(p => p.map(s => s.id === newId ? { ...s, entered: true } : s)), 60);
    };

    const handleGoogleError = () => console.error('Google login failed');

    // ── Helpers ─────────────────────────────────────────────────────────────────
    const spring = (delay = 0) => ({
        opacity: heroEntered ? 1 : 0,
        transform: heroEntered ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.9s cubic-bezier(0.34,1.56,0.64,1) ${delay}s`
    });

    const revealStyle = (visible, delay = 0, dir = 'up') => ({
        opacity: visible ? 1 : 0,
        transform: visible
            ? 'translateY(0) scale(1)'
            : dir === 'up' ? 'translateY(48px) scale(0.97)' : 'translateY(-20px)',
        transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.85s cubic-bezier(0.34,1.56,0.64,1) ${delay}s`
    });

    const modules = [
        { icon: Layers,    humanTitle: '✅ To-Do Lists',    humanDesc: 'Jot it down. Check it off. Feel that sweet satisfaction.', c: '#06B6D4', tape: true  },
        { icon: Rocket,    humanTitle: '🔥 Habit Streaks',  humanDesc: 'Build habits like a human: slowly, imperfectly, consistently.', c: '#10B981', tape: false },
        { icon: Clock,     humanTitle: '🍅 Focus Timer',    humanDesc: 'Pomodoro timer. Put your phone away. You can do this.', c: '#3B82F6', tape: true  },
        { icon: Shield,    humanTitle: '🔒 Your Data Only', humanDesc: "We don't sell your habits. We're humans too — we hate that.", c: '#8B5CF6', tape: false },
        { icon: Zap,       humanTitle: '☁️ Cloud Sync',     humanDesc: "Open on your phone, your laptop, your sister's tablet. All synced.", c: '#F59E0B', tape: true  },
        { icon: Activity,  humanTitle: '📈 Progress Charts',humanDesc: 'See your actual progress. Even the bad weeks. Especially the bad weeks.', c: '#EC4899', tape: false },
    ];

    const testimonials = [
        { name: 'Priya S.', role: 'UX Designer',   avatar: '👩‍💻', stars: 5, quote: '"I finally stopped using 6 different apps. This is the one I actually open every morning."', accent: '#06B6D4' },
        { name: 'Marcus T.', role: 'Entrepreneur', avatar: '👨‍🚀', stars: 5, quote: '"The habit streaks actually motivated me in a way that felt human, not like a chore."', accent: '#10B981' },
        { name: 'Aiko R.',  role: 'Student',        avatar: '🧑‍🎓', stars: 5, quote: '"I drew on the scratchpad during a lecture and somehow retained everything. Love this app."', accent: '#8B5CF6' },
    ];

    const rotations = [-1.5, 1.2, -0.8, 1.5, -1, 0.7];

    return (
        <div
            className={`landing-host ${subTheme === 'human' ? 'human-theme' : ''}`}
            style={{
                background: subTheme === 'human'
                    ? 'linear-gradient(160deg, #0f0a1a 0%, #1a1025 50%, #120d1e 100%)'
                    : 'linear-gradient(135deg, #020617 0%, #0a0a0f 100%)',
                color: '#F8FAFC',
                minHeight: '100vh',
                fontFamily: 'var(--font-primary, "Outfit", sans-serif)',
                overflowX: 'hidden',
                position: 'relative'
            }}
        >
            <SEO
                title="Master Your Performance: Habit Tracker"
                description="LifeFlow is your warm, human productivity companion. Track habits, manage tasks, and focus — built for real people, not robots."
            />

            {/* ── GLOBAL STYLES ─────────────────────────────────────────── */}
            <style>{`
                .landing-host { scrollbar-width: none; }
                .landing-host::-webkit-scrollbar { display: none; }

                /* ── Core Animations ── */
                @keyframes lp-float {
                    0%,100% { transform: translateY(0px) rotate(var(--r,0deg)); }
                    50%     { transform: translateY(-14px) rotate(var(--r,0deg)); }
                }
                @keyframes lp-wobble {
                    0%,100% { transform: rotate(var(--r,0deg)); }
                    25%     { transform: rotate(calc(var(--r,0deg) + 4deg)); }
                    75%     { transform: rotate(calc(var(--r,0deg) - 4deg)); }
                }
                @keyframes lp-bounce-in {
                    0%   { opacity:0; transform: scale(0.3) rotate(20deg); }
                    60%  { opacity:1; transform: scale(1.15) rotate(-5deg); }
                    80%  { transform: scale(0.92) rotate(2deg); }
                    100% { opacity:1; transform: scale(1) rotate(var(--r,0deg)); }
                }
                @keyframes lp-slide-up {
                    from { opacity:0; transform: translateY(40px); }
                    to   { opacity:1; transform: translateY(0); }
                }
                @keyframes lp-fade-in {
                    from { opacity:0; }
                    to   { opacity:1; }
                }
                @keyframes lp-spin-slow {
                    to { transform: rotate(360deg); }
                }
                @keyframes lp-pulse-dot {
                    0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
                    50%     { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
                }
                @keyframes lp-marquee {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
                @keyframes lp-shake {
                    0%,100% { transform: rotate(var(--r,0deg)); }
                    20%     { transform: rotate(calc(var(--r,0deg) - 6deg)) scale(1.1); }
                    40%     { transform: rotate(calc(var(--r,0deg) + 5deg)) scale(1.08); }
                    60%     { transform: rotate(calc(var(--r,0deg) - 3deg)); }
                    80%     { transform: rotate(calc(var(--r,0deg) + 2deg)); }
                }
                @keyframes lp-pencil-write {
                    from { stroke-dashoffset: 800; }
                    to   { stroke-dashoffset: 0; }
                }
                @keyframes lp-card-in {
                    from { opacity:0; transform: translateY(60px) rotate(var(--r,0deg)) scale(0.9); }
                    to   { opacity:1; transform: translateY(0) rotate(var(--r,0deg)) scale(1); }
                }
                @keyframes lp-shimmer {
                    from { background-position: -400px 0; }
                    to   { background-position: 400px 0; }
                }
                @keyframes lp-wavetext {
                    0%,100% { transform: translateY(0); }
                    50%     { transform: translateY(-6px); }
                }
                @keyframes lp-glow-pulse {
                    0%,100% { opacity: 0.5; transform: scale(1); }
                    50%     { opacity: 0.8; transform: scale(1.08); }
                }
                @keyframes lp-checkmark {
                    0%   { stroke-dashoffset: 30; }
                    100% { stroke-dashoffset: 0; }
                }
                @keyframes lp-notebook-line {
                    from { transform: scaleX(0); }
                    to   { transform: scaleX(1); }
                }

                /* ── Utility ── */
                .lp-particle {
                    animation: lp-float var(--dur, 6s) ease-in-out infinite;
                    animation-delay: var(--delay, 0s);
                    --r: var(--rot, 0deg);
                }
                .glass-pill-human {
                    background: rgba(255,255,255,0.7);
                    border: 2px dashed rgba(var(--primary-rgb, 6,182,212), 0.4);
                    backdrop-filter: blur(8px);
                    border-radius: 100px;
                }
                .human-card {
                    background: var(--bg-card, #fff);
                    border: 2.5px solid var(--glass-border, rgba(0,0,0,0.12));
                    box-shadow: 6px 8px 0 rgba(0,0,0,0.08);
                    border-radius: 18px 240px 18px 220px / 18px 18px 220px 18px;
                    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
                }
                .human-card:hover {
                    transform: translateY(-6px) scale(1.01) !important;
                    box-shadow: 8px 14px 0 rgba(0,0,0,0.1);
                }
                .module-card {
                    background: var(--bg-card, #fff);
                    border: 2px solid var(--glass-border, rgba(0,0,0,0.1));
                    border-radius: 20px;
                    padding: 2.2rem;
                    position: relative;
                    overflow: visible;
                    cursor: default;
                    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                                box-shadow 0.3s ease;
                    box-shadow: 4px 6px 0 rgba(0,0,0,0.06);
                }
                .module-card:hover {
                    box-shadow: 8px 12px 0 rgba(0,0,0,0.1);
                }
                .btn-cta-human {
                    background: var(--primary, #06b6d4);
                    color: white;
                    border: none;
                    font-weight: 800;
                    border-radius: 16px;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                                box-shadow 0.3s ease;
                    box-shadow: 0 6px 20px -4px rgba(var(--primary-rgb,6,182,212),0.5),
                                4px 4px 0 rgba(0,0,0,0.12);
                }
                .btn-cta-human::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
                    pointer-events: none;
                }
                .btn-cta-human:hover {
                    transform: translateY(-3px) scale(1.04);
                    box-shadow: 0 12px 28px -4px rgba(var(--primary-rgb,6,182,212),0.6),
                                4px 8px 0 rgba(0,0,0,0.15);
                }
                .btn-cta-human:active {
                    transform: translateY(1px) scale(0.98);
                }
                .tape-strip {
                    position: absolute;
                    top: -12px; left: 50%;
                    transform: translateX(-50%);
                    width: 64px; height: 22px;
                    background: rgba(202,138,4,0.28);
                    border: 1px solid rgba(202,138,4,0.35);
                    border-radius: 4px;
                    z-index: 5;
                    pointer-events: none;
                }
                .tape-strip::after {
                    content: '';
                    position: absolute;
                    inset: 3px;
                    background: repeating-linear-gradient(
                        90deg,
                        rgba(202,138,4,0.08) 0px,
                        rgba(202,138,4,0.08) 4px,
                        transparent 4px,
                        transparent 8px
                    );
                }
                .doodle-sticker {
                    position: fixed;
                    font-size: 2.2rem;
                    z-index: 200;
                    cursor: grab;
                    user-select: none;
                    touch-action: none;
                    transition: filter 0.2s;
                    filter: drop-shadow(2px 3px 0 rgba(0,0,0,0.15));
                }
                .doodle-sticker:active { cursor: grabbing; filter: drop-shadow(3px 5px 0 rgba(0,0,0,0.2)); }
                .sticker-drawer-btn {
                    position: fixed; bottom: 2rem; right: 2rem;
                    z-index: 201;
                    width: 52px; height: 52px; border-radius: 50%;
                    background: var(--primary); color: #fff;
                    font-size: 1.4rem; border: none; cursor: pointer;
                    box-shadow: 0 4px 16px rgba(var(--primary-rgb,6,182,212),0.5), 3px 3px 0 rgba(0,0,0,0.15);
                    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
                    display: flex; align-items: center; justify-content: center;
                }
                .sticker-drawer-btn:hover { transform: scale(1.12) rotate(10deg); }
                .sticker-options-panel {
                    position: fixed; bottom: 5.5rem; right: 2rem;
                    z-index: 202;
                    background: var(--bg-card, #fff);
                    border: 2px solid var(--glass-border);
                    border-radius: 20px;
                    padding: 1rem;
                    display: flex; flex-wrap: wrap; gap: 0.5rem;
                    max-width: 220px;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.15), 4px 4px 0 rgba(0,0,0,0.08);
                    animation: lp-slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1);
                }
                .sticker-opt-btn {
                    background: none; border: none;
                    font-size: 1.6rem; cursor: pointer;
                    border-radius: 10px; padding: 0.3rem;
                    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
                }
                .sticker-opt-btn:hover { transform: scale(1.35) rotate(8deg); }
                .wave-char {
                    display: inline-block;
                    animation: lp-wavetext 1.2s ease-in-out infinite;
                }

                /* Notebook lines behind hero */
                .nb-lines {
                    position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0;
                }
                .nb-line {
                    position: absolute; left: 0; right: 0;
                    height: 1px;
                    background: rgba(var(--primary-rgb,6,182,212),0.07);
                    transform-origin: left;
                    animation: lp-notebook-line 1.2s cubic-bezier(0.16,1,0.3,1) both;
                }

                /* Cursor glow */
                .cursor-glow {
                    position: absolute;
                    width: 320px; height: 320px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(var(--primary-rgb,6,182,212),0.18) 0%, transparent 70%);
                    pointer-events: none;
                    will-change: transform;
                    transition: opacity 0.3s;
                    top: 0; left: 0;
                    animation: lp-glow-pulse 3s ease-in-out infinite;
                }

                /* Stat card shimmer */
                .stat-card-shimmer {
                    background: linear-gradient(
                        90deg,
                        var(--bg-card,#fff) 0%,
                        rgba(var(--primary-rgb,6,182,212),0.06) 50%,
                        var(--bg-card,#fff) 100%
                    );
                    background-size: 400px;
                    animation: lp-shimmer 2.4s infinite;
                }

                /* Human header bg */
                .human-header {
                    background: rgba(253,249,240,0.85) !important;
                    backdrop-filter: blur(14px);
                    border-bottom: 2px dashed rgba(var(--primary-rgb,6,182,212),0.18) !important;
                }

                /* Pencil SVG path */
                .pencil-path {
                    stroke-dasharray: 800;
                    stroke-dashoffset: 800;
                }
                .pencil-path.draw {
                    animation: lp-pencil-write 2s cubic-bezier(0.16,1,0.3,1) forwards;
                }

                /* Checkmark animation */
                .check-path {
                    stroke-dasharray: 30;
                    stroke-dashoffset: 30;
                    animation: lp-checkmark 0.5s ease-out 0.6s forwards;
                }

                /* Canvas wipe */
                .canvas-label { font-size:0.78rem; color:var(--text-muted); font-style: italic; }

                /* Mobile fixes */
                @media (max-width: 900px) {
                    .hero-grid-human { grid-template-columns: 1fr !important; }
                    .hero-visual-human { display: none !important; }
                    .engine-2col { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 768px) {
                    .cursor-glow { display: none; }
                    .nb-lines { display: none; }
                    .module-card { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                }
            `}</style>

            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <header
                className={scrolled ? 'human-header' : ''}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                    padding: scrolled ? '0.9rem 2rem' : '1.4rem 2rem',
                    borderBottom: scrolled ? '' : '2px dashed transparent',
                    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
            >
                {/* Logo */}
                <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', cursor:'pointer' }}>
                    <div style={{ position:'relative' }}>
                        <div style={{
                            position:'absolute', inset:0,
                            background:'var(--primary)',
                            filter:'blur(6px)', opacity:0.4, borderRadius:'8px'
                        }} />
                        <img src="/logo.png" alt="LifeFlow" style={{ height:'32px', width:'auto', borderRadius:'8px', position:'relative', zIndex:1 }} />
                    </div>
                    <span style={{ fontSize:'1.2rem', fontWeight:900, letterSpacing:'-0.02em', color:'var(--text-main)' }}>
                        LifeFlow
                    </span>
                    <span style={{
                        fontSize:'0.68rem', fontWeight:700, background:'var(--primary)',
                        color:'#fff', padding:'2px 8px', borderRadius:'100px',
                        letterSpacing:'0.05em', marginLeft:'-4px'
                    }}>HUMAN</span>
                </div>

                {/* Nav */}
                <div style={{ display:'flex', gap:'0.8rem', alignItems:'center' }}>
                    <button
                        style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: 'white', padding: '0.55rem 1.2rem', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', border: 'none', borderRadius: '100px', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                        onClick={toggleSubTheme}
                        title="Switch to pi +"
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.6)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.4)'; }}
                    >
                        💻 pi +
                    </button>
                    <button
                        style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--primary)', border: '2px dashed rgba(6, 182, 212, 0.4)', borderRadius: '100px', padding: '0.55rem 1.2rem', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                    >
                        Sign In
                    </button>
                    <button
                        className="btn-cta-human"
                        style={{ padding:'0.6rem 1.5rem', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'6px' }}
                        onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                    >
                        Get Started <ChevronRight size={14} />
                    </button>
                </div>
            </header>

            {/* ── HERO ────────────────────────────────────────────────────── */}
            <section
                ref={heroRef}
                style={{
                    position:'relative', zIndex:10,
                    paddingTop:'11rem', paddingBottom:'6rem',
                    minHeight:'100vh', display:'flex', alignItems:'center',
                    overflow:'hidden'
                }}
            >
                {/* Cursor glow */}
                <div ref={glowRef} className="cursor-glow" />

                {/* Notebook lines */}
                <div className="nb-lines">
                    {[20,32,44,56,68,80].map((pct, i) => (
                        <div key={i} className="nb-line" style={{ top:`${pct}%`, animationDelay:`${i * 0.15}s` }} />
                    ))}
                </div>

                {/* Ambient blobs */}
                <div style={{
                    position:'absolute', top:'-10%', right:'-5%',
                    width:'500px', height:'500px',
                    background:'radial-gradient(circle, rgba(var(--primary-rgb,6,182,212),0.1) 0%, transparent 65%)',
                    filter:'blur(80px)', pointerEvents:'none', animation:'lp-glow-pulse 6s ease-in-out infinite'
                }} />
                <div style={{
                    position:'absolute', bottom:'-5%', left:'-5%',
                    width:'400px', height:'400px',
                    background:'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)',
                    filter:'blur(90px)', pointerEvents:'none', animation:'lp-glow-pulse 8s ease-in-out infinite reverse'
                }} />

                {/* Floating background particles */}
                {heroEntered && <>
                    <Particle emoji="📝" style={{ top:'12%', left:'7%', '--dur':'7s', '--delay':'0s', '--rot':'-8deg' }} />
                    <Particle emoji="🎨" style={{ top:'25%', right:'6%', '--dur':'9s', '--delay':'1s', '--rot':'12deg' }} />
                    <Particle emoji="✨" style={{ bottom:'30%', left:'4%', '--dur':'8s', '--delay':'0.5s', '--rot':'-5deg' }} />
                    <Particle emoji="🌟" style={{ bottom:'15%', right:'8%', '--dur':'6s', '--delay':'2s', '--rot':'10deg' }} />
                    <Particle emoji="💫" style={{ top:'55%', left:'12%', '--dur':'10s', '--delay':'1.5s', '--rot':'-12deg' }} />
                </>}

                <div
                    className="hero-grid-human"
                    style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'center', maxWidth:'1300px', margin:'0 auto', padding:'0 2rem', width:'100%' }}
                >
                    {/* Left: Content */}
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', position:'relative', zIndex:2 }}>

                        {/* Badge */}
                        <div style={{
                            ...spring(0),
                            display:'inline-flex', alignItems:'center', gap:'8px',
                            background:'rgba(var(--primary-rgb,6,182,212),0.1)',
                            border:'2px dashed rgba(var(--primary-rgb,6,182,212),0.3)',
                            borderRadius:'100px', padding:'6px 16px', marginBottom:'2rem'
                        }}>
                            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#10B981', animation:'lp-pulse-dot 2s infinite' }} />
                            <span style={{ fontSize:'0.72rem', fontWeight:800, color:'var(--text-main)', letterSpacing:'0.1em' }}>
                                ✏️ MADE BY HUMANS, FOR HUMANS
                            </span>
                        </div>

                        {/* H1 */}
                        <h1 style={{
                            ...spring(0.1),
                            fontSize:'clamp(3.2rem, 6vw, 5.8rem)', fontWeight:900,
                            lineHeight:'1.05', letterSpacing:'-0.03em', marginBottom:'1.2rem'
                        }}>
                            <span style={{ color:'var(--text-main)' }}>Master Your</span><br />
                            <span style={{ color:'var(--primary)', display:'inline-block', position:'relative' }}>
                                Daily Chaos.
                                <ScribbleUnderline visible={heroEntered} />
                            </span>
                        </h1>

                        {/* Wave subtitle */}
                        <div style={{ ...spring(0.22), overflow:'hidden', marginBottom:'2.5rem' }}>
                            <p style={{ fontSize:'1.15rem', color:'var(--text-dim)', lineHeight:'1.65', maxWidth:'500px' }}>
                                Your second brain{' '}
                                <span style={{ color:'var(--primary)', fontWeight:700 }}>(since your first one</span>{' '}
                                is full of browser tabs, coffee cups, and cat memes). A beautifully simple space to track habits, write down tasks, and focus without losing your sanity.
                            </p>
                        </div>

                        {/* CTA Row */}
                        <div style={{ ...spring(0.32), display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center' }}>
                            <button
                                className="btn-cta-human"
                                style={{ padding:'1rem 2.2rem', fontSize:'1.05rem', display:'flex', alignItems:'center', gap:'8px' }}
                                onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                            >
                                ✏️ Get Started — it's free!
                            </button>
                            <span style={{
                                fontFamily:'var(--font-heading)', fontSize:'0.98rem',
                                color:'var(--primary)', transform:'rotate(-4deg)',
                                display:'inline-block', marginLeft:'8px',
                                animation: heroEntered ? 'lp-wobble 3s ease-in-out infinite 1.5s' : 'none'
                            }}>
                                ← your life changes here
                            </span>
                        </div>

                        {/* Trust line */}
                        <div style={{ ...spring(0.42), display:'flex', alignItems:'center', gap:'12px', marginTop:'2rem' }}>
                            <div style={{ display:'flex', gap:'2px' }}>
                                {[1,2,3,4,5].map(s => <span key={s} style={{ color:'#F59E0B', fontSize:'1rem' }}>★</span>)}
                            </div>
                            <span style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>
                                4.9 / 5.0 App Store Rating
                            </span>
                        </div>
                    </div>

                    {/* Right: Scratchpad card */}
                    <div
                        className="hero-visual-human"
                        style={{
                            ...spring(0.45),
                            position:'relative', display:'flex', justifyContent:'center'
                        }}
                    >
                        {/* Decorative floating cards */}
                        <div style={{
                            position:'absolute', top:'-24px', right:'-20px',
                            background:'var(--bg-card,#fff)', border:'2px solid var(--glass-border)',
                            borderRadius:'16px', padding:'12px 18px',
                            boxShadow:'4px 6px 0 rgba(0,0,0,0.08)',
                            animation:'lp-float 5s ease-in-out infinite',
                            zIndex:3
                        }}>
                            <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.05em' }}>TODAY'S STREAK</div>
                            <div style={{ fontSize:'1.6rem', fontWeight:900, color:'#F59E0B' }}>🔥 14 days</div>
                        </div>
                        <div style={{
                            position:'absolute', bottom:'-20px', left:'-24px',
                            background:'var(--bg-card,#fff)', border:'2px solid var(--glass-border)',
                            borderRadius:'16px', padding:'12px 18px',
                            boxShadow:'4px 6px 0 rgba(0,0,0,0.08)',
                            animation:'lp-float 6s ease-in-out infinite 1s',
                            zIndex:3
                        }}>
                            <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.05em' }}>TASKS TODAY</div>
                            <div style={{ fontSize:'1.4rem', fontWeight:900, color:'#10B981' }}>
                                12<span style={{ fontSize:'0.9rem', color:'var(--text-muted)' }}>/14 done ✅</span>
                            </div>
                        </div>

                        {/* Main scratchpad */}
                        <div className="human-card" style={{ width:'400px', padding:'2.2rem 2rem', position:'relative', zIndex:2 }}>
                            <div className="coffee-stain" style={{ top:'-38px', right:'-38px' }} />
                            <h3 style={{ fontSize:'1.35rem', fontWeight:800, color:'var(--primary)', marginBottom:'0.4rem', display:'flex', alignItems:'center', gap:'8px' }}>
                                ✏️ Human Scratchpad
                            </h3>
                            <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'1rem' }}>
                                Draw something. Or just scribble. It's okay.
                            </p>
                            <canvas
                                onMouseDown={e => { const c=e.target; const r=c.getBoundingClientRect(); c._d=true; c._lp={x:e.clientX-r.left,y:e.clientY-r.top}; }}
                                onMouseMove={e => { const c=e.target; if(!c._d)return; const r=c.getBoundingClientRect(); const p={x:e.clientX-r.left,y:e.clientY-r.top}; const ctx=c.getContext('2d'); ctx.beginPath(); ctx.strokeStyle='var(--primary)'; ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.moveTo(c._lp.x,c._lp.y); ctx.lineTo(p.x,p.y); ctx.stroke(); c._lp=p; }}
                                onMouseUp={e=>{e.target._d=false;}} onMouseLeave={e=>{e.target._d=false;}}
                                onTouchStart={e=>{const c=e.target;const r=c.getBoundingClientRect();c._d=true;c._lp={x:e.touches[0].clientX-r.left,y:e.touches[0].clientY-r.top};}}
                                onTouchMove={e=>{const c=e.target;if(!c._d)return;const r=c.getBoundingClientRect();const p={x:e.touches[0].clientX-r.left,y:e.touches[0].clientY-r.top};const ctx=c.getContext('2d');ctx.beginPath();ctx.strokeStyle='var(--primary)';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.moveTo(c._lp.x,c._lp.y);ctx.lineTo(p.x,p.y);ctx.stroke();c._lp=p;}}
                                onTouchEnd={e=>{e.target._d=false;}}
                                style={{ width:'100%', height:'220px', border:'2px dashed var(--glass-border)', borderRadius:'12px', background:'rgba(var(--primary-rgb,6,182,212),0.02)', cursor:'crosshair', touchAction:'none', display:'block' }}
                                ref={el=>{
                                    if(el&&!el._init){
                                        el._init=true;
                                        el.width=el.offsetWidth||350;
                                        el.height=el.offsetHeight||220;
                                        // Draw a sample squiggly line
                                        const ctx=el.getContext('2d');
                                        ctx.strokeStyle='rgba(var(--primary-rgb,6,182,212),0.3)';
                                        ctx.lineWidth=2;
                                        ctx.lineCap='round';
                                        ctx.beginPath();
                                        ctx.moveTo(30,80);
                                        for(let i=0;i<12;i++){ctx.quadraticCurveTo(30+i*25,80+(i%2===0?-20:20),30+(i+1)*25,80);}
                                        ctx.stroke();
                                        ctx.font='italic 13px Georgia, serif';
                                        ctx.fillStyle='rgba(var(--primary-rgb,6,182,212),0.35)';
                                        ctx.fillText('draw here → your space!', 60, 170);
                                    }
                                }}
                            />
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'10px' }}>
                                <span className="canvas-label">Mouse / finger — your canvas!</span>
                                <button
                                    style={{ padding:'5px 12px', fontSize:'0.75rem', cursor:'pointer', borderRadius:'10px', border:'1.5px dashed var(--glass-border)', background:'transparent', color:'var(--text-muted)', fontWeight:600, transition:'all 0.2s ease' }}
                                    onClick={e=>{const c=e.target.closest('.human-card').querySelector('canvas');if(c){const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);}}}
                                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(var(--primary-rgb),0.08)';}}
                                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}
                                >
                                    Wipe Clean ✨
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ANIMATED MARQUEE ────────────────────────────────────────── */}
            <div style={{ overflow:'hidden', borderTop:'2px dashed rgba(var(--primary-rgb,6,182,212),0.12)', borderBottom:'2px dashed rgba(var(--primary-rgb,6,182,212),0.12)', padding:'1.1rem 0', position:'relative', zIndex:10, background:'rgba(var(--primary-rgb,6,182,212),0.03)' }}>
                <div style={{ display:'flex', gap:'3.5rem', animation:'lp-marquee 26s linear infinite', width:'max-content', alignItems:'center' }}>
                    {[

                        { stat:'4.9 ★',   label:'App Store Rating' },
                        { stat:'2M+',     label:'Tasks Checked Off' },
                        { stat:'98%',     label:'Would Recommend' },
                        { stat:'Free',    label:'Forever Core Plan' },
                        { stat:'🔥 14',   label:'Day Avg. Streak' },

                        { stat:'4.9 ★',   label:'App Store Rating' },
                        { stat:'2M+',     label:'Tasks Checked Off' },
                        { stat:'98%',     label:'Would Recommend' },
                        { stat:'Free',    label:'Forever Core Plan' },
                        { stat:'🔥 14',   label:'Day Avg. Streak' },
                    ].map((item, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.8rem', whiteSpace:'nowrap' }}>
                            <span style={{ fontSize:'1.05rem', fontWeight:900, color:'var(--primary)' }}>{item.stat}</span>
                            <span style={{ fontSize:'0.83rem', color:'var(--text-muted)', fontWeight:500 }}>{item.label}</span>
                            <span style={{ color:'rgba(var(--primary-rgb,6,182,212),0.2)', fontSize:'1.2rem' }}>·</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── STATS ROW ────────────────────────────────────────────────── */}
            <section
                ref={statsRef}
                style={{
                    padding:'5rem 2rem', position:'relative', zIndex:10,
                    ...revealStyle(statsVisible, 0)
                }}
            >
                <div style={{ maxWidth:'900px', margin:'0 auto' }}>
                    <div style={{ textAlign:'center', marginBottom:'3rem' }}>
                        <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:900, color:'var(--text-main)' }}>
                            In numbers, since you love numbers 📊
                        </h2>
                        <ScribbleUnderline visible={statsVisible} />
                    </div>
                    <div style={{
                        display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))',
                        gap:'1.5rem'
                    }}>
                        {[
                            { value:2000000, label:'Tasks Done',    suffix:'+' },
                            { value:98, label:'% Would Recommend',  suffix:'%' },
                            { value:14, label:'Avg Streak (days)',  suffix:' 🔥' },
                        ].map((s, i) => (
                            <div key={i} className="stat-card-shimmer" style={{
                                ...revealStyle(statsVisible, i * 0.1),
                                borderRadius:'20px', border:'2px dashed rgba(var(--primary-rgb,6,182,212),0.2)',
                                boxShadow:'4px 6px 0 rgba(0,0,0,0.06)',
                                background:'var(--bg-card,#fff)'
                            }}>
                                <AnimatedStat value={s.value} label={s.label} suffix={s.suffix} started={statsVisible} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── INTELLIGENCE / WHY SECTION ───────────────────────────────── */}
            <section
                ref={engRef}
                style={{
                    padding:'6rem 2rem', position:'relative', zIndex:10,
                    borderTop:'2px dashed rgba(var(--primary-rgb,6,182,212),0.1)'
                }}
            >
                <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
                    <div
                        className="engine-2col"
                        style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem', alignItems:'center' }}
                    >
                        {/* Left text */}
                        <div style={{ ...revealStyle(engVisible, 0) }}>
                            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', color:'var(--primary)', fontSize:'0.8rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'1.5rem' }}>
                                <Edit size={16} /> Simple & Authentic
                            </div>
                            <h2 style={{ fontSize:'clamp(2.2rem,4vw,3.2rem)', fontWeight:900, lineHeight:'1.1', marginBottom:'1.5rem', color:'var(--text-main)' }}>
                                Built for Real Humans,<br />
                                <span style={{ color:'var(--text-dim)' }}>Not Robots.</span>
                            </h2>
                            <p style={{ fontSize:'1.05rem', color:'var(--text-dim)', lineHeight:'1.75', marginBottom:'2.5rem' }}>
                                We know you get distracted (us too!). LifeFlow lets you balance your routines naturally. No complex algorithms or heavy data collection — just an honest, warm layout and easy trackers.
                            </p>
                            <div style={{ display:'flex', flexDirection:'column', gap:'1.6rem' }}>
                                {[
                                    { icon:Target,   title:'Focus Booster',   desc:'Simple Pomodoro focus sessions with nice organic ambient alerts.' },
                                    { icon:Activity, title:'Habits & Streaks', desc:'Check off items on your notebook page and watch your XP grow.' },
                                    { icon:Heart,    title:'Made with Care',   desc:'Every pixel was considered by someone who also forgets to drink water.' },
                                ].map((item, i) => (
                                    <div key={i} style={{ ...revealStyle(engVisible, i * 0.15), display:'flex', gap:'1.2rem', alignItems:'flex-start' }}>
                                        <div style={{ background:'rgba(var(--primary-rgb,6,182,212),0.1)', padding:'10px', borderRadius:'14px', color:'var(--primary)', flexShrink:0 }}>
                                            <item.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize:'1rem', fontWeight:800, color:'var(--text-main)', marginBottom:'0.3rem' }}>{item.title}</h4>
                                            <p style={{ color:'var(--text-dim)', lineHeight:'1.55', fontSize:'0.9rem' }}>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Interactive habit preview */}
                        <div style={{ ...revealStyle(engVisible, 0.2) }}>
                            <div className="human-card" style={{ padding:'2rem', position:'relative' }}>
                                <div className="coffee-stain" style={{ bottom:'-30px', right:'-30px', opacity:0.5 }} />
                                <h4 style={{ fontWeight:800, color:'var(--primary)', marginBottom:'1.4rem', fontSize:'1.05rem' }}>
                                    📋 Today's Check-ins
                                </h4>
                                <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
                                    {[
                                        { label:'Morning walk', done:true,  color:'#10B981' },
                                        { label:'Drink 8 cups of water', done:true,  color:'#3B82F6' },
                                        { label:'Read 20 pages',          done:false, color:'#F59E0B' },
                                        { label:'No doom-scrolling before bed', done:false, color:'#8B5CF6' },
                                    ].map((h, i) => (
                                        <div key={i} style={{
                                            display:'flex', alignItems:'center', gap:'12px',
                                            padding:'12px 16px',
                                            background: h.done ? `rgba(${h.color === '#10B981' ? '16,185,129' : '59,130,246'},0.06)` : 'rgba(0,0,0,0.02)',
                                            borderRadius:'14px',
                                            border:`1.5px ${h.done ? 'solid' : 'dashed'} rgba(0,0,0,0.08)`,
                                            animation:`lp-slide-up 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.4 + i*0.12}s both`,
                                            opacity: engVisible ? 1 : 0
                                        }}>
                                            <div style={{
                                                width:'22px', height:'22px', borderRadius:'7px',
                                                border:`2px solid ${h.color}`,
                                                background: h.done ? h.color : 'transparent',
                                                display:'flex', alignItems:'center', justifyContent:'center',
                                                flexShrink:0, transition:'all 0.3s ease'
                                            }}>
                                                {h.done && (
                                                    <svg width="12" height="10" viewBox="0 0 12 10">
                                                        <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" className="check-path" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span style={{ fontSize:'0.9rem', fontWeight:600, color: h.done ? 'var(--text-dim)' : 'var(--text-main)', textDecoration: h.done ? 'line-through' : 'none' }}>
                                                {h.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop:'1.2rem', padding:'12px', background:'rgba(var(--primary-rgb,6,182,212),0.06)', borderRadius:'14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                    <span style={{ fontSize:'0.85rem', color:'var(--text-dim)', fontWeight:600 }}>Today's progress</span>
                                    <span style={{ fontSize:'1.1rem', fontWeight:900, color:'var(--primary)' }}>2 / 4 🌱</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MODULE GRID ──────────────────────────────────────────────── */}
            <section
                ref={gridRef}
                style={{ padding:'7rem 2rem', position:'relative', zIndex:10, borderTop:'2px dashed rgba(var(--primary-rgb,6,182,212),0.1)' }}
            >
                <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
                    <div style={{ textAlign:'center', marginBottom:'5rem' }}>
                        <p style={{ color:'var(--primary)', fontSize:'0.78rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:'0.8rem' }}>
                            Everything You Need
                        </p>
                        <h2 style={{ fontSize:'clamp(2.2rem,4vw,3.2rem)', fontWeight:900, color:'var(--text-main)' }}>
                            📒 Your Daily Toolkit.
                        </h2>
                        <ScribbleUnderline visible={gridVisible} />
                        <p style={{ color:'var(--text-dim)', fontSize:'1.1rem', maxWidth:'560px', margin:'1.5rem auto 0', lineHeight:'1.65' }}>
                            All the tools you actually need. No bloat. Built by humans, for humans.
                        </p>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px,1fr))', gap:'2rem' }}>
                        {modules.map((mod, i) => (
                            <div
                                key={i}
                                className="module-card"
                                style={{
                                    '--r': `${rotations[i]}deg`,
                                    opacity: gridVisible ? 1 : 0,
                                    transform: gridVisible
                                        ? `translateY(0) rotate(${rotations[i]}deg)`
                                        : `translateY(64px) rotate(${rotations[i]}deg) scale(0.88)`,
                                    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s, transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1}s`
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'rotate(0deg) scale(1.03) translateY(-6px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = `rotate(${rotations[i]}deg)`; }}
                            >
                                {mod.tape && <div className="tape-strip" />}
                                <div className="paperclip-overlay" />

                                <div style={{
                                    width:'54px', height:'54px',
                                    borderRadius:'40% 60% 50% 60% / 60% 40% 60% 40%',
                                    marginBottom:'1.5rem',
                                    background:`rgba(${parseInt(mod.c.slice(1,3),16)},${parseInt(mod.c.slice(3,5),16)},${parseInt(mod.c.slice(5,7),16)},0.1)`,
                                    border:`2px dashed rgba(${parseInt(mod.c.slice(1,3),16)},${parseInt(mod.c.slice(3,5),16)},${parseInt(mod.c.slice(5,7),16)},0.35)`,
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    color:mod.c,
                                    transition:'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)'
                                }}>
                                    <mod.icon size={24} />
                                </div>
                                <h3 style={{ fontSize:'1.18rem', fontWeight:800, marginBottom:'0.7rem', color:'var(--text-main)', lineHeight:1.2 }}>
                                    {mod.humanTitle}
                                </h3>
                                <p style={{ color:'var(--text-dim)', lineHeight:'1.65', fontSize:'0.93rem' }}>
                                    {mod.humanDesc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
            <section
                ref={testRef}
                style={{ padding:'7rem 2rem', position:'relative', zIndex:10, borderTop:'2px dashed rgba(var(--primary-rgb,6,182,212),0.1)' }}
            >
                <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
                    <div style={{ textAlign:'center', marginBottom:'4rem', ...revealStyle(testVisible, 0) }}>
                        <p style={{ color:'var(--primary)', fontSize:'0.78rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:'0.8rem' }}>
                            Real People, Real Results
                        </p>
                        <h2 style={{ fontSize:'clamp(2rem,3.5vw,2.8rem)', fontWeight:900, color:'var(--text-main)' }}>
                            ❤️ People who actually use this
                        </h2>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px,1fr))', gap:'1.5rem' }}>
                        {testimonials.map((t, i) => (
                            <div
                                key={i}
                                className="human-card"
                                style={{
                                    padding:'2rem',
                                    borderTop:`4px solid ${t.accent}`,
                                    borderRadius:'20px',
                                    ...revealStyle(testVisible, i * 0.15)
                                }}
                            >
                                <div style={{ display:'flex', gap:'3px', marginBottom:'1rem' }}>
                                    {Array(t.stars).fill(0).map((_,s) => <span key={s} style={{ color:'#F59E0B', fontSize:'0.95rem' }}>★</span>)}
                                </div>
                                <p style={{ fontSize:'0.97rem', lineHeight:'1.7', color:'var(--text-dim)', marginBottom:'1.5rem', fontStyle:'italic' }}>
                                    {t.quote}
                                </p>
                                <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                                    <div style={{
                                        width:'42px', height:'42px', borderRadius:'50%',
                                        background:`linear-gradient(135deg,${t.accent}33,${t.accent}11)`,
                                        border:`2px solid ${t.accent}44`,
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        fontSize:'1.3rem'
                                    }}>{t.avatar}</div>
                                    <div>
                                        <div style={{ fontWeight:800, color:'var(--text-main)', fontSize:'0.92rem' }}>{t.name}</div>
                                        <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Aggregate */}
                    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'2rem', marginTop:'3.5rem', flexWrap:'wrap', ...revealStyle(testVisible, 0.4) }}>
                        <div style={{ display:'flex', gap:'4px' }}>
                            {[1,2,3,4,5].map(s => <span key={s} style={{ color:'#F59E0B', fontSize:'1.4rem' }}>★</span>)}
                        </div>
                        <div>
                            <div style={{ fontSize:'1.5rem', fontWeight:900, color:'var(--text-main)' }}>4.9 / 5.0</div>
                            <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>Based on 3,200+ reviews</div>
                        </div>
                        
                    </div>
                </div>
            </section>

            {/* ── CTA FOOTER ───────────────────────────────────────────────── */}
            <footer
                ref={ctaRef}
                style={{ position:'relative', zIndex:10, padding:'6rem 2rem 2rem', borderTop:'2px dashed rgba(var(--primary-rgb,6,182,212),0.15)' }}
            >
                <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
                    {/* Big CTA */}
                    <div
                        className="human-card"
                        style={{
                            padding:'4rem 2rem', textAlign:'center', marginBottom:'5rem',
                            borderColor:'rgba(var(--primary-rgb,6,182,212),0.3)',
                            position:'relative', overflow:'visible',
                            ...revealStyle(ctaVisible, 0)
                        }}
                    >
                        <div className="coffee-stain" style={{ bottom:'-30px', left:'-30px', opacity:0.35 }} />
                        <div className="notebook-binder-rings">
                            {[0,1,2,3].map(r => <div key={r} className="notebook-ring" />)}
                        </div>
                        <h2 style={{ fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, color:'var(--text-main)', marginBottom:'1.2rem' }}>
                            🙌 Ready to stop procrastinating?
                        </h2>
                        <p style={{ color:'var(--text-dim)', fontSize:'1.1rem', marginBottom:'2.5rem', maxWidth:'500px', margin:'0 auto 2.5rem', lineHeight:'1.65' }}>
                            Seriously, just try it. It takes 30 seconds to sign up. You've spent longer watching that one YouTube video for the third time.
                        </p>
                        <button
                            className="btn-cta-human"
                            style={{ padding:'1.1rem 3rem', fontSize:'1.1rem', fontWeight:800, borderRadius:'18px', cursor:'pointer' }}
                            onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                        >
                            ✏️ Get Started (it's free!)
                        </button>
                        <div style={{ marginTop:'1.5rem', fontSize:'0.85rem', color:'var(--text-muted)' }}>
                            No credit card. No nonsense. Just vibes. ☕
                        </div>
                    </div>

                    {/* Footer links */}
                    <div style={{ display:'grid', gridTemplateColumns:'minmax(220px,2fr) 1fr 1fr', gap:'3rem', marginBottom:'4rem' }}>
                        <div>
                            <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', marginBottom:'1.2rem' }}>
                                <img src="/logo.png" alt="LifeFlow" style={{ height:'30px', borderRadius:'8px' }} />
                                <span style={{ fontSize:'1.1rem', fontWeight:900, color:'var(--text-main)' }}>LifeFlow</span>
                            </div>
                            <p style={{ color:'var(--text-muted)', lineHeight:'1.7', fontSize:'0.9rem', maxWidth:'280px' }}>
                                A warm, human productivity companion. Track habits, manage tasks, and focus — for real people, not robots.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color:'var(--text-main)', fontWeight:800, marginBottom:'1.2rem' }}>Platform</h4>
                            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                                {['Habits','Tasks','Schedule','Analytics'].map(l => (
                                    <span key={l} style={{ color:'var(--text-muted)', cursor:'pointer', fontSize:'0.9rem', transition:'color 0.2s' }}
                                        onMouseEnter={e=>e.target.style.color='var(--primary)'} onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>{l}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ color:'var(--text-main)', fontWeight:800, marginBottom:'1.2rem' }}>Legal</h4>
                            <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                                <span style={{ color:'var(--text-muted)', cursor:'pointer', fontSize:'0.9rem', transition:'color 0.2s' }}
                                    onClick={()=>setActiveLegal('privacy')} onMouseEnter={e=>e.target.style.color='var(--primary)'} onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>Privacy Policy</span>
                                <span style={{ color:'var(--text-muted)', cursor:'pointer', fontSize:'0.9rem', transition:'color 0.2s' }}
                                    onClick={()=>setActiveLegal('terms')} onMouseEnter={e=>e.target.style.color='var(--primary)'} onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>Terms of Service</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ paddingTop:'2rem', borderTop:'2px dashed rgba(var(--primary-rgb,6,182,212),0.15)', display:'flex', justifyContent:'space-between', color:'var(--text-muted)', fontSize:'0.83rem', flexWrap:'wrap', gap:'1rem', alignItems:'center' }}>
                        <span>© 2026 LifeFlow. Built with too much coffee ☕</span>
                        <span style={{ fontFamily:'var(--font-heading)', color:'var(--primary)', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'6px' }}>
                            💛 100% Human-made. No robots were harmed.
                        </span>
                    </div>
                </div>
            </footer>

            {/* ── AUTH MODAL ───────────────────────────────────────────────── */}
            {showAuthModal && (
                <div
                    style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.4)', backdropFilter:'blur(8px)', padding:'1rem', animation:'lp-fade-in 0.25s ease-out' }}
                    onClick={()=>setShowAuthModal(false)}
                >
                    <div
                        className="human-card"
                        style={{ width:'100%', maxWidth:'420px', padding:'2.5rem 2rem', position:'relative', background:'linear-gradient(145deg, #1a1028, #0f0d1a)', border:'1px solid rgba(139, 92, 246, 0.2)', boxShadow:'0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139, 92, 246, 0.1)', animation:'lp-slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
                        onClick={e=>e.stopPropagation()}
                    >
                        <button style={{ position:'absolute', top:'18px', right:'18px', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', borderRadius:'10px', padding:'4px', transition:'background 0.2s' }} onClick={()=>setShowAuthModal(false)}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.05)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                            <X size={20} />
                        </button>

                        <div style={{ textAlign:'center', marginBottom:'2.2rem' }}>
                            <img src="/logo.png" style={{ width:'48px', height:'48px', borderRadius:'12px', marginBottom:'1.2rem', boxShadow:'0 6px 20px rgba(var(--primary-rgb,6,182,212),0.25)' }} />
                            <h2 style={{ fontSize:'1.7rem', fontWeight:900, color:'#F8FAFC' }}>
                                {authMode === 'signin' ? '👋 Welcome Back!' : '✨ Join LifeFlow'}
                            </h2>
                            <p style={{ color:'rgba(248,250,252,0.6)', marginTop:'0.4rem', fontSize:'0.92rem' }}>
                                {authMode === 'signin' ? 'Good to see you again, human.' : 'Start your 30-second setup.'}
                            </p>
                        </div>

                        <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.5rem' }}>
                            <GoogleLogin
                                onSuccess={(res) => handleLoginSuccess(res, authMode)}
                                onError={handleGoogleError}
                                theme="outline"
                                size="large"
                                text={authMode === 'signin' ? 'signin_with' : 'signup_with'}
                                shape="pill"
                            />
                        </div>

                        <p style={{ fontSize:'0.78rem', color:'rgba(248,250,252,0.5)', textAlign:'center' }}>
                            By continuing, you agree to our{' '}
                            <span style={{ color:'var(--primary)', cursor:'pointer' }} onClick={()=>{setShowAuthModal(false);setActiveLegal('terms');}}>Terms</span>
                            {' '}and{' '}
                            <span style={{ color:'var(--primary)', cursor:'pointer' }} onClick={()=>{setShowAuthModal(false);setActiveLegal('privacy');}}>Privacy Policy</span>.
                        </p>
                    </div>
                </div>
            )}

            {activeLegal && (
                <LegalModal activeTab={activeLegal} onClose={()=>setActiveLegal(null)} />
            )}

            {/* ── DRAGGABLE STICKERS ───────────────────────────────────────── */}
            {subTheme === 'human' && (
                <>
                    {stickers.map((s) => (
                        <div
                            key={s.id}
                            className="doodle-sticker"
                            style={{
                                left:`${s.x}px`, top:`${s.y}px`,
                                '--r': `${s.rotate}deg`,
                                opacity: s.entered ? 1 : 0,
                                transform: s.entered
                                    ? `rotate(${s.rotate}deg) scale(1)`
                                    : `rotate(${s.rotate + 20}deg) scale(0.2)`,
                                transition: 'opacity 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                            }}
                            onMouseDown={(e) => handleStickerDragStart(e, s.id)}
                            onTouchStart={(e) => handleStickerDragStart(e, s.id)}
                        >
                            {s.emoji}
                        </div>
                    ))}

                    {isStickerDrawerOpen && (
                        <div className="sticker-options-panel">
                            {['☕','⚡','💡','⭐','🔥','🎯','📝','🎨','💎','🍀','✨','🌈'].map(em => (
                                <button key={em} className="sticker-opt-btn" onClick={() => addSticker(em)}>{em}</button>
                            ))}
                        </div>
                    )}

                    <button
                        className="sticker-drawer-btn"
                        onClick={() => setIsStickerDrawerOpen(o => !o)}
                        title="Add a sticker!"
                    >
                        {isStickerDrawerOpen ? '✕' : '🎨'}
                    </button>
                </>
            )}
        </div>
    );
};

export default LandingView;
