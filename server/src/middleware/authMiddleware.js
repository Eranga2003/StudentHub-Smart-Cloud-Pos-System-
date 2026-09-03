import { auth } from '../config/firebase.js';
import { UnauthorizedError } from '../errors/AppError.js';

/**
 * Firebase Authentication Middleware
 * Validates JWT ID token from Authorization header and sets req.user.
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or malformed');
    }

    const token = authHeader.split('Bearer ')[1]?.trim();
    if (!token) {
      throw new UnauthorizedError('Bearer token value is required');
    }

    if (!auth) {
      throw new UnauthorizedError('Firebase Auth service is currently not available');
    }

    // Verify token using Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(token);

    // Attach user information to the request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      role: decodedToken.role || null,
      claims: decodedToken,
    };

    return next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    // Convert Firebase token errors to standard UnauthorizedError
    return next(new UnauthorizedError('Invalid or expired authentication token', error.message));
  }
};

export default authMiddleware;
