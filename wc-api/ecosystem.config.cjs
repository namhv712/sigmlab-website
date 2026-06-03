// pm2 process config for the World Cup betting API.
// Deploy target: /var/www/sigmlab/wc-api/  (Node v24.13+ for node:sqlite).
// server.js loads ./.env itself via a tiny KEY=VALUE parser, so pm2 only
// needs to point at the script and cwd.
module.exports = {
  apps: [
    {
      name: 'wc-api',
      script: 'src/server.js',
      cwd: '/var/www/sigmlab/wc-api',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
