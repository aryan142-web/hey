import { useEffect } from 'react';

const SITE_NAME = 'LifeFlow';
const SITE_URL = 'https://www.pi78.ink';
const DEFAULT_DESCRIPTION = 'LifeFlow is the ultimate all-in-one daily life tracker. Maximize productivity, track habits, manage tasks, and optimize your routines with our high-performance dashboard.';
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

/**
 * SEO Component — injects dynamic meta tags for every view.
 * Handles: <title>, description, keywords, Open Graph (og:*), Twitter Card, canonical.
 */
const SEO = ({ title, description, keywords, image, canonical }) => {
    useEffect(() => {
        const fullTitle = title
            ? `${title} | ${SITE_NAME}`
            : `${SITE_NAME} – Ultimate Daily Life Tracker & Productivity Dashboard`;

        // ── Title ──────────────────────────────────────────────────────────
        document.title = fullTitle;

        const setMeta = (selector, attr, value) => {
            const el = document.querySelector(selector);
            if (el && value) el.setAttribute(attr, value);
        };

        const resolvedDesc = description || DEFAULT_DESCRIPTION;
        const resolvedImage = image || DEFAULT_IMAGE;
        const resolvedURL = canonical || SITE_URL;

        // ── Description ────────────────────────────────────────────────────
        setMeta('meta[name="description"]', 'content', resolvedDesc);

        // ── Keywords ───────────────────────────────────────────────────────
        if (keywords) setMeta('meta[name="keywords"]', 'content', keywords);

        // ── Canonical ──────────────────────────────────────────────────────
        let canonicalEl = document.querySelector('link[rel="canonical"]');
        if (canonicalEl) canonicalEl.setAttribute('href', resolvedURL);

        // ── Open Graph ─────────────────────────────────────────────────────
        setMeta('meta[property="og:title"]', 'content', title || SITE_NAME);
        setMeta('meta[property="og:description"]', 'content', resolvedDesc);
        setMeta('meta[property="og:image"]', 'content', resolvedImage);
        setMeta('meta[property="og:url"]', 'content', resolvedURL);

        // ── Twitter Card ───────────────────────────────────────────────────
        setMeta('meta[name="twitter:title"]', 'content', title || SITE_NAME);
        setMeta('meta[name="twitter:description"]', 'content', resolvedDesc);
        setMeta('meta[name="twitter:image"]', 'content', resolvedImage);

    }, [title, description, keywords, image, canonical]);

    return null;
};

export default SEO;
