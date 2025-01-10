/**
 * @file connectDB.js
 * @description This file contains the configuration and function to connect to the MongoDB database using Mongoose.
 * @module config/connectDB
 */

import mongoose from "mongoose";



mongoose.set('strictQuery', false);
import dotenv from 'dotenv';
dotenv.config();

/**
 * Asynchronously connects to the MongoDB database using the connection URI
 * specified in the environment variable `MONGO_URI`.
 *
 * @async
 * @function connectToDB
 * @returns {Promise<void>} A promise that resolves when the connection is successful.
 * @throws Will throw an error if the connection fails.
 */
const connectToDB = async () => {
    try {
     
        const client = await mongoose.connect(process.env.MONGO_URI);

        if (client) {
            console.log("Connected to DB: ", client.connection.host);
        }
    } catch (error) {
        console.log(error);
    }
}

export default connectToDB;