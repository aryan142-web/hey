import React, { useRef, useState, useEffect } from 'react';
import { Palette, Trash2, Edit } from 'lucide-react';

const DoodleScratchpad = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('graphite');
    const lastPos = useRef({ x: 0, y: 0 });

    const getColorValue = (c) => {
        switch (c) {
            case 'red': return '#dc2626';
            case 'green': return '#16a34a';
            case 'highlight': return 'rgba(234, 179, 8, 0.4)';
            case 'graphite':
            default: return 'var(--text-main)';
        }
    };

    // Load saved drawing on mount
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const savedDrawing = localStorage.getItem('pi78_sidebar_doodle');
        if (savedDrawing) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = savedDrawing;
        }

        // Adjust for high-DPI displays
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Re-draw after resize
        if (savedDrawing) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, rect.width, rect.height);
            };
            img.src = savedDrawing;
        }
    }, []);

    const saveCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        localStorage.setItem('pi78_sidebar_doodle', canvas.toDataURL());
    };

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        
        if (e.touches && e.touches[0]) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        const pos = getCoordinates(e);
        lastPos.current = pos;
    };

    const draw = (e) => {
        if (!isDrawing) return;
        
        // Prevent scrolling on touch devices when drawing inside canvas
        if (e.cancelable) e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const currentPos = getCoordinates(e);

        ctx.beginPath();
        ctx.strokeStyle = getColorValue(color);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = color === 'highlight' ? 12 : 2.5;
        
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();

        lastPos.current = currentPos;
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveCanvas();
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        localStorage.removeItem('pi78_sidebar_doodle');
    };

    return (
        <div style={{
            marginTop: '1.25rem',
            padding: '0.85rem',
            borderRadius: '16px',
            border: '2px dashed var(--glass-border)',
            background: 'var(--ui-bg-low)',
            position: 'relative'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
            }}>
                <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <Edit size={11} /> Mind Scratchpad
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {['graphite', 'red', 'green', 'highlight'].map((c) => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            title={`${c} pen`}
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                border: color === c ? '2px solid var(--text-main)' : '1px solid var(--glass-border)',
                                background: c === 'graphite' ? '#71717a' : c === 'red' ? '#dc2626' : c === 'green' ? '#16a34a' : '#eab308',
                                padding: 0,
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                transform: color === c ? 'scale(1.2)' : 'none'
                            }}
                        />
                    ))}
                    <button
                        onClick={clearCanvas}
                        title="Clear Sketchbook"
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '2px',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{
                    width: '100%',
                    height: '110px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    cursor: 'crosshair',
                    touchAction: 'none'
                }}
            />
        </div>
    );
};

export default DoodleScratchpad;
