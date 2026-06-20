import React from 'react';
import { X, ShieldCheck, FileText, Scale } from 'lucide-react';

const LegalModal = ({ activeTab, onClose }) => {
    if (!activeTab) return null;

    const content = {
        privacy: {
            title: 'Privacy Policy',
            icon: ShieldCheck,
            lastUpdated: 'February 8, 2026',
            sections: [
                {
                    heading: '1. Information Collection',
                    text: 'We collect minimal data necessary to provide our services. This includes account information (name, email) and usage data (habits, tasks). We prioritized local-first storage for sensitive tracking data.'
                },
                {
                    heading: '2. Data Usage',
                    text: 'Your data is used solely to improve your tracking experience. We do not sell your personal data to third parties. Anonymized aggregation may be used for analytical purposes.'
                },
                {
                    heading: '3. Data Security',
                    text: 'We implement industry-standard security measures to protect your information. Your sessions are encrypted.'
                }
            ]
        },
        terms: {
            title: 'Terms of Service',
            icon: FileText,
            lastUpdated: 'February 8, 2026',
            sections: [
                {
                    heading: '1. Acceptance',
                    text: 'By using pi78.ink, you agree to these terms. If you do not agree, please discontinue use of the service.'
                },
                {
                    heading: '2. User Conduct',
                    text: 'You are responsible for all activity that occurs under your account. You agree not to use the service for any illegal or unauthorized purpose.'
                },
                {
                    heading: '3. Intellectual Property',
                    text: 'The service and its original content, features, and functionality are owned by pi78.ink and are protected by international copyright laws.'
                }
            ]
        },
        compliance: {
            title: 'Compliance',
            icon: Scale,
            lastUpdated: 'February 8, 2026',
            sections: [
                {
                    heading: '1. GDPR Compliance',
                    text: 'We respect your right to data privacy. EU users have the right to access, rectify, and erase their data.'
                },
                {
                    heading: '2. CCPA Compliance',
                    text: 'California residents have specific rights regarding their personal information. We provide transparency about data collection and do not sell personal data.'
                },
                {
                    heading: '3. Accessibility',
                    text: 'We are committed to making our website accessible to everyone, including people with disabilities.'
                }
            ]
        }
    };

    const currentData = content[activeTab] || content.privacy;
    const Icon = currentData.icon;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(20px)', background: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
            <div className="modal glass-premium" onClick={e => e.stopPropagation()} style={{
                maxWidth: '700px',
                width: '90%',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '0',
                borderRadius: '32px',
                border: '1px solid var(--glass-border)',
                overflow: 'hidden',
                boxShadow: '0 40px 80px rgba(0,0,0,0.4)'
            }}>
                {/* Header */}
                <div style={{ padding: '2rem 3rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--ui-bg-low)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'var(--primary-glow)', padding: '0.8rem', borderRadius: '14px', color: 'var(--primary)' }}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.03em' }}>
                                {currentData.title}
                            </h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Last updated: {currentData.lastUpdated}</p>
                        </div>
                    </div>
                    <button className="btn btn-glass" onClick={onClose} style={{ width: '44px', height: '44px', borderRadius: '14px', border: '1px solid var(--ui-border-soft)' }}>
                        <X size={20} color="var(--text-dim)" />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '3rem', overflowY: 'auto', lineHeight: '1.8', color: 'var(--text-main)', fontSize: '0.95rem', background: 'var(--ui-bg)' }}>
                    {currentData.sections.map((section, index) => (
                        <div key={index} style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--text-main)' }}>{section.heading}</h3>
                            <p style={{ color: 'var(--text-dim)', lineHeight: '1.7' }}>{section.text}</p>
                        </div>
                    ))}

                    <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--ui-bg-low)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            For further inquiries, please contact our legal team at legal@pi78.ink
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '1.5rem 3rem', background: 'var(--ui-bg-low)', borderTop: '1px solid var(--glass-border)', textAlign: 'right' }}>
                    <button className="btn btn-primary" onClick={onClose} style={{ borderRadius: '14px', padding: '0.8rem 2rem', fontWeight: 800 }}>I Understand</button>
                </div>
            </div>
        </div>
    );
};

export default LegalModal;
