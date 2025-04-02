import { mailer } from '../services/mailer.service.js';
import path from 'path';
import fs from 'fs';

import logger from '../utils/logger.js';

// Path to the birthday email template
const birthdayTemplatePath = path.join(path.dirname(new URL(import.meta.url).pathname), '../templates/birthday.template.html');

/**
 * Mailer controller for sending birthday emails
 * @param {string} to - The recipient's email address
 * @param {string} subject - The subject of the email
 * @param {string} name - The recipient's name
 * @returns {Promise<void>} - A promise that resolves when the email is sent
 */
export const sendBirthdayEmail = async (to, subject, name) => {

  // Mock email by logging to console
  console.log(`Sending email to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Name: ${name}`);

  return; // Uncomment this line to send actual emails

  let template = fs.readFileSync(birthdayTemplatePath, 'utf8');
  template = template.replace('{{ name }}', name);
  template = template.replace('{{ year }}', new Date().getFullYear());

  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    html: template,
  };

  return new Promise((resolve, reject) => {
    mailer.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error(`Error sending email to ${to}: ${error.message}`);
        reject(new Error(`Failed to send email: ${error.message}`));
      } else {
        resolve();
      }
    });
  });
};