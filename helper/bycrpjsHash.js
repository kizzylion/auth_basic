const bcrpt = require("bcryptjs");

module.exports.hashPassword = async (password) => {
  return await bcrpt.hash(password, 10);
};

module.exports.comparePassword = async (password, hashedPassword) => {
  return await bcrpt.compare(password, hashedPassword);
};
