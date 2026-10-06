import { spawn } from 'node:child_process';
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], { stdio: 'inherit' });
let desktop;
for (let i = 0; i < 80; i++) { try { const r = await fetch('http://127.0.0.1:5173'); if (r.ok) break; } catch {} await new Promise(r => setTimeout(r, 250)); }
const { default: electron } = await import('electron');
desktop = spawn(electron, ['.'], { stdio: 'inherit', env: { ...process.env, PUPPET_DEV_URL: 'http://127.0.0.1:5173' } });
desktop.on('exit', code => { vite.kill(); process.exit(code ?? 0); });
process.on('SIGINT', () => { desktop.kill(); vite.kill(); });
