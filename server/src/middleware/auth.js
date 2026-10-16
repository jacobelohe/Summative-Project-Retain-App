import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';

/**
 * Requires a valid `Authorization: Bearer <jwt>` header.
 * The user is re-loaded from the database so deleted users or
 * changed roles take effect immediately.
 */
export async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized());
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }

  const user = await User.findById(payload.sub);
  if (!user) return next(ApiError.unauthorized('User no longer exists'));

  req.user = user;
  next();
}

/** Restricts a route to the given roles. Use after `authenticate`. */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}
