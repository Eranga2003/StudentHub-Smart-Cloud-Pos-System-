import env from './config/environment.js';
import { firebaseApp } from './config/firebase.js';
import app from './app.js';

const PORT = env.PORT || 5000;

const startServer = () => {
  try {
    const server = app.listen(PORT, () => {
      console.log('==================================================');
      console.log(' Student Hub POS API');
      console.log(` Environment: ${env.NODE_ENV}`);
      console.log(` Port:        ${PORT}`);
      console.log(` Base URL:    /api/v1`);
      console.log(` Health URL:  http://localhost:${PORT}/api/v1/health`);
      console.log(
        ` Firebase:    ${firebaseApp ? 'Initialized' : 'Offline / Mock mode (Pending credentials)'}`
      );
      console.log('==================================================');
    });

    // Graceful shutdown handling
    const shutdown = (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Global error traps for unhandled exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();
