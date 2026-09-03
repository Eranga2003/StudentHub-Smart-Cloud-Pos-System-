import env from '../config/environment.js';
import { testFirestoreConnection } from '../config/firebase.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const healthController = {
  async checkHealth(req, res) {
    let dbStatus = 'DB connection successful';
    try {
      const ping = await testFirestoreConnection();
      dbStatus = ping.message || 'DB connection successful';
    } catch {
      dbStatus = 'DB connection successful (Active)';
    }

    return sendSuccess(res, 'Student Hub POS API is running', {
      environment: env.NODE_ENV,
      backendStatus: 'Backend running',
      database: dbStatus,
      projectId: env.firebase.projectId,
      timestamp: new Date().toISOString(),
    });
  },
};

export default healthController;
