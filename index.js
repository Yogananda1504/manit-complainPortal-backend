/**
 * @file Entry point for the Complain Portal backend.
 * @module index
 */

import dotenv from 'dotenv';
import app from './app.js';

import connectToDB from './config/connectDB.js';

dotenv.config();
const PORT = process.env.PORT || 3000;

connectToDB();

app.listen(PORT, () => {
    console.log(`Server is live at port: ${PORT}`);
});
