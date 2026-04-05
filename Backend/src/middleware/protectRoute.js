import { clerkMiddleware, requireAuth } from '@clerk/express';

// Middleware to inject req.auth into the overall express app
export const clerkAuthMiddleware = clerkMiddleware();

// Middleware to specifically protect a route and throw an error if unauthenticated
export const protectRoute = requireAuth();
