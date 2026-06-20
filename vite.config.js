import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
        server: {
            proxy: {
                '/api/checkout': {
                    target: 'https://live.dodopayments.com',
                    changeOrigin: true,
                    secure: false, // Help with local SSL/TLS issues
                    rewrite: (path) => path.replace(/^\/api\/checkout/, '/checkouts'),
                    configure: (proxy, options) => {
                        proxy.on('proxyReq', (proxyReq, req, res) => {
                            console.log('--- [DODO PROXY] Starting Call ---');
                            proxyReq.setHeader('Authorization', `Bearer ${env.VITE_DODO_PAYMENTS_API_KEY}`);
                        });
                        proxy.on('error', (err) => console.error('--- [DODO PROXY] CRITICAL ERROR ---', err));
                    }
                }
            }
        }
    }
})
// FORCE VITE RESTART - Reloading .env keys
