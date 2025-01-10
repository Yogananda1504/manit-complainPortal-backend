/**
 * @file Token Utilities module.
 * @module utils/tokenUtils
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

/**
 * Generates a JWT token.
 * @param {Object} payload - The payload to encode in the token.
 * @returns {string} The generated JWT token.
 * @throws {Error} If JWT_EXPIRES_IN is not set or invalid.
 */
const generateToken = (payload) => {
    if (!JWT_EXPIRES_IN || typeof JWT_EXPIRES_IN !== 'string') {
        throw new Error('Invalid JWT_EXPIRES_IN value');
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifies a JWT token.
 * @param {string} token - The token to verify.
 * @returns {Object} The decoded token payload.
 * @throws {Error} If the token is invalid.
 */
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
}

export { generateToken, verifyToken };