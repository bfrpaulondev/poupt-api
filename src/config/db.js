const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.warn('AVISO: MONGODB_URI nao definida. A API vai iniciar sem base de dados.');
      console.warn('Define MONGODB_URI nas variaveis de ambiente para ativar a persistencia.');
      return;
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB ligado: ${conn.connection.host}`);
  } catch (erro) {
    console.error(`Erro ao ligar MongoDB: ${erro.message}`);
    console.warn('A API vai continuar sem ligacao a base de dados.');
  }
};

module.exports = connectDB;
