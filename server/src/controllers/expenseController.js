import { expenseService } from '../services/expenseService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const expenseController = {
  async getExpenses(req, res, next) {
    try {
      const expenses = await expenseService.getAllExpenses();
      return sendSuccess(res, 'Expenses API is ready', expenses);
    } catch (error) {
      return next(error);
    }
  },
};

export default expenseController;
