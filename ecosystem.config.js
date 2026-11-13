// PM2: deploy.yml o'zi ishga tushiradi (`pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js`).
// Sirlar va manzillar — `.env` da (Next build va `next start` o'zi o'qiydi). Bu yerga yozmang: PM2 env'dagi bo'sh qiymat
// `.env` ni bekitib qo'yadi. Eski env qolgan bo'lsa: pm2 delete plus.tasimo.uz && pm2 start ecosystem.config.js && pm2 save
const fs = require('fs');
const path = require('path');

// Faol build papkasi: deploy.yml `.next-slot` ga yozadi (.next-a yoki .next-b); fayl bo'lmasa — qo'lda build qilingan .next
function activeDistDir() {
  try {
    const slot = fs.readFileSync(path.join(__dirname, '.next-slot'), 'utf8').trim();
    return ['.next-a', '.next-b'].includes(slot) ? slot : '.next';
  } catch {
    return '.next';
  }
}

module.exports = {
  apps: [
    {
      name: 'plus.tasimo.uz',
      script: 'bun',
      args: 'start',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '768M',
      env: {
        NODE_ENV: 'production',
        PORT: 3101,
        NEXT_DIST_DIR: activeDistDir(),
      },
    },
  ],
};
