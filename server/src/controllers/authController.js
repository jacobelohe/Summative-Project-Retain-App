import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/token.js';

function authResponse(user) {
  return { token: signToken(user), user: user.toPublic() };
}

/** POST /api/auth/register — public sign-up always creates a regular user. */
export async function register(req, res) {
  const { name, email, password } = req.body;

  const exists = await User.exists({ email: email.toLowerCase() });
  if (exists) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({ name, email, password, role: 'user' });
  res.status(201).json(authResponse(user));
}

/** POST /api/auth/login */
export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  res.json(authResponse(user));
}

/** GET /api/auth/me — returns the currently authenticated user. */
export async function me(req, res) {
  res.json({ user: req.user.toPublic() });
}
