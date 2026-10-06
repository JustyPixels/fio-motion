import { spawnSync } from 'node:child_process';
import { mkdirSync, copyFileSync } from 'node:fs';
const compiler = spawnSync('rustup', ['which', 'rustc'], { encoding: 'utf8' });
const result = spawnSync('cargo', ['build', '--manifest-path', 'engine/Cargo.toml', '--target', 'wasm32-unknown-unknown', '--release'], { stdio: 'inherit', env: { ...process.env, ...(compiler.status === 0 ? { RUSTC: compiler.stdout.trim() } : {}), CARGO_NET_OFFLINE: 'false' } });
if (result.status !== 0) process.exit(result.status ?? 1);
mkdirSync('public/engine', { recursive: true });
copyFileSync('engine/target/wasm32-unknown-unknown/release/puppet_engine.wasm', 'public/engine/puppet_engine.wasm');
console.log('Deformation engine ready.');
