import nodemailer from 'nodemailer';
import config from '../config/mailer.config.js';

/**
 * Mailer service for sending emails
 * @module services/mailer.service
 */

const transporter = nodemailer.createTransport({
  host: config.HOST,
  port: config.PORT,
  auth: {
    user: config.USER,
    pass: config.PASSWORD,
  },
});

export { transporter as mailer };