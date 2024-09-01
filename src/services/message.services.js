import { MessageModel } from '../models/message.model.js';

export const getMessages = async () => {
  return await MessageModel.find().sort({ timestamp: 1 });
};

export const postMessage = async ({ user, message }) => {
  const newMessage = new MessageModel({ user, message });
  return await newMessage.save();
};
