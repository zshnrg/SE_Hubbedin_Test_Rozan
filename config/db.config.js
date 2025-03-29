import dotenv from 'dotenv';
dotenv.config();

export default {
  DB_URL: process.env.DB_URL || 'mongodb://localhost:27017/birthdayDB',
}