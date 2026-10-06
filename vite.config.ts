import { defineConfig } from 'vite';
export default defineConfig({ base: './', server: { host: '127.0.0.1', port: 5173, strictPort: true, watch: { ignored: ['**/.cache/**','**/qa-results/**','**/release/**','**/engine/target/**','**/vendor/**'] } }, test: { environment: 'node', include: ['tests/**/*.test.ts'] } } as any);
