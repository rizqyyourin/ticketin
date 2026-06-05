module.exports = {
  apps: [{
    name: 'ticketin',
    script: 'node_modules/.bin/next',
    args: 'start --port 3001',
    cwd: '/var/www/ticketin',

    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },

    // Fork mode - Next.js handles its own concurrency
    instances: 1,
    exec_mode: 'fork',

    // Auto-restart settings
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',

    // Memory management
    max_memory_restart: '512M',

    // Logging
    out_file: '/var/log/pm2/ticketin-out.log',
    error_file: '/var/log/pm2/ticketin-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    combine_logs: true,
    merge_logs: true,

    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 8000,
    shutdown_with_message: true,
    restart_delay: 4000,
  }]
};
