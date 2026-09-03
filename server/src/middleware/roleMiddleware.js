import { ForbiddenError, UnauthorizedError } from '../errors/AppError.js';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Ensures the authenticated user possesses one of the allowed roles.
 * Must be placed after authMiddleware in the route pipeline.
 *
 * @param {...string} allowedRoles - List of authorized roles (e.g. 'ADMIN', 'MANAGER')
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.get('/inventory', authMiddleware, requireRole('ADMIN', 'MANAGER', 'INVENTORY_MANAGER'), inventoryController.getInventory);
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required before role verification'));
    }

    const userRole = req.user.role;

    if (!userRole) {
      return next(new ForbiddenError('No role assigned to user account'));
    }

    const isAllowed = allowedRoles.includes(userRole);

    if (!isAllowed) {
      return next(
        new ForbiddenError(
          `Forbidden: Role '${userRole}' is not authorized to access this resource`
        )
      );
    }

    return next();
  };
};

export default requireRole;
