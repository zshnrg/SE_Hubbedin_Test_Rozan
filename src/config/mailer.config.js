export default {
  HOST: process.env.MAIL_HOST || 'smtp.example.com',
  PORT: process.env.MAIL_PORT || 587,
  USER: process.env.MAIL_USER || "user",
  PASSWORD: process.env.MAIL_PASSWORD || "password",
}