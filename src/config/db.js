const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    console.log(`MongoDB ligado: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('Erro na ligacao MongoDB:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB desconectado. A tentar reconectar...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconectado com sucesso');
    });
  } catch (err) {
    console.error(`Erro MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
