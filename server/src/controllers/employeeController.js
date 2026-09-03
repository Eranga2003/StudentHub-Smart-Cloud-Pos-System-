import { employeeService } from '../services/employeeService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const employeeController = {
  async getEmployees(req, res, next) {
    try {
      const employees = await employeeService.getAllEmployees();
      return sendSuccess(res, 'Employees API is ready', employees);
    } catch (error) {
      return next(error);
    }
  },
};

export default employeeController;
