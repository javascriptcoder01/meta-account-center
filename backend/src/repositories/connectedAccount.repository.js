import ConnectedAccount from '../models/ConnectedAccount.js';

export const findConnectedAccountsByUserId = async (userId) => {
  return ConnectedAccount.find({ userId });
};

export const findConnectedAccountByProvider = async (provider, providerUserId) => {
  return ConnectedAccount.findOne({ provider, providerUserId });
};

export const createConnectedAccount = async (accountData) => {
  return ConnectedAccount.create(accountData);
};

export const deleteConnectedAccountById = async (id) => {
  return ConnectedAccount.findByIdAndDelete(id);
};

export default {
  findConnectedAccountsByUserId,
  findConnectedAccountByProvider,
  createConnectedAccount,
  deleteConnectedAccountById
};
