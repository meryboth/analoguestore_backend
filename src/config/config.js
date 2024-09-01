import dotenv from 'dotenv';
import program from '../utils/process.js';

const { mode } = program.opts();

dotenv.config({
  path: mode === 'produccion' ? './.env.prod' : './.env.dev',
});

const configObject = {
  port: process.env.PORT,
  mongo_url: process.env.MONGO_URL,
  githubClientID: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  githubCallbackURL: process.env.GITHUB_CALLBACK_URL,
  jwt_secret: process.env.JWT_SECRET,
  filesystem_path: process.env.FILESYSTEM_PATH,
  data_source: process.env.DATA_SOURCE,
  front_url: process.env.FRONT_URL,
  mail_user: process.env.GOOGLE_MAIL,
  mail_pass: process.env.GOOGLE_PASS,
  twilio_phone: process.env.TWILIO_PHONE,
};

export default configObject;
