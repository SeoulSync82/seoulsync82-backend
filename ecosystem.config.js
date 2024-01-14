module.exports = {
  apps: [
    {
      name: 'seoulsync82-backend',
      script: './dist/main.js',
      max_memory_restart: '2G',
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'dev',
      },
      env_staging: {
        NODE_ENV: 'staging',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
