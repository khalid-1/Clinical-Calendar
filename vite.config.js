import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Clinical-Calendar/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'save-schedule-middleware',
      configureServer(server) {
        // GET Changelog
        server.middlewares.use('/api/changelog', (req, res, next) => {
          if (req.method === 'GET') {
            try {
              const filePath = path.resolve(__dirname, 'src/data/changelog.json');
              if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf-8');
                res.statusCode = 200;
                res.end(data);
              } else {
                res.statusCode = 200;
                res.end('[]');
              }
            } catch (error) {
              console.error('❌ Error reading changelog:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error.message }));
            }
          } else {
            next();
          }
        });

        // POST Save Schedule
        server.middlewares.use('/api/save-schedule', (req, res, next) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body);
                // Payload can be just array (old) or { scheduleData, logEntry } (new)

                let dataToSave = payload;
                let logEntry = null;

                if (!Array.isArray(payload) && payload.scheduleData) {
                  dataToSave = payload.scheduleData;
                  logEntry = payload.logEntry;
                }

                // 1. Save Schedule
                const filePath = path.resolve(__dirname, 'src/data/schedule.json');
                fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));

                // 2. Append Log
                if (logEntry) {
                  const changelogPath = path.resolve(__dirname, 'src/data/changelog.json');
                  let logs = [];
                  if (fs.existsSync(changelogPath)) {
                    logs = JSON.parse(fs.readFileSync(changelogPath, 'utf-8'));
                  }
                  if (!logEntry.timestamp) logEntry.timestamp = new Date().toISOString();

                  logs.unshift(logEntry); // Add new entry to top
                  fs.writeFileSync(changelogPath, JSON.stringify(logs, null, 2));
                }

                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, message: 'File and log saved successfully' }));
                console.log('✅ Schedule and Log saved successfully via middleware');
              } catch (error) {
                console.error('❌ Error saving schedule:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: error.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
})
