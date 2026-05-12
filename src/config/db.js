const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB ligado: ${conn.connection.host}`);
  } catch (erro) {
    console.error(`Erro ao ligar MongoDB: ${erro.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
