import User from '../models/User.js';

export const findUserById = async (id) => {
  return User.findById(id);
};

export const findUserByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase() });
};

export const createUser = async (userData) => {
  return User.create(userData);
};

export const updateUserById = async (id, updateData) => {
  return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

export const deleteUserById = async (id) => {
  return User.findByIdAndDelete(id);
};

export default {
  findUserById,
  findUserByEmail,
  createUser,
  updateUserById,
  deleteUserById
};
