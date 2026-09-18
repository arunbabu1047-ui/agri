import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { cwd } from 'node:process';

const spaRoutes = ['admin/login.html', 'admin/reset-password.html', 'news', 'videos', 'resources', 'about', 'contact'];

function spaRouteFiles() {
  return {
    name: 'spa-route-files',
    apply: 'build',
    closeBundle() {
      const indexPath = resolve(cwd(), 'dist/index.html');
      if (!existsSync(indexPath)) return;
      const indexHtml = readFileSync(indexPath, "utf8");
      spaRoutes.forEach((route) => {
        const target = resolve(cwd(), 'dist', route);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, indexHtml, "utf8");
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), spaRouteFiles()],
  server: { port: 5173 },
});
