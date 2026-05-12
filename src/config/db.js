const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

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
    return true;
  } catch (err) {
    console.error(`Erro MongoDB: ${err.message}`);
    console.error('A tentar reconectar em 5 segundos...');
    return false;
  }
};

const reconnectDB = async () => {
  let connected = await connectDB();
  while (!connected) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    connected = await connectDB();
  }
};

const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

mongoose.connection.on('error', (err) => {
  console.error('Erro na ligacao MongoDB:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB desconectado. A tentar reconectar...');
  setTimeout(reconnectDB, 5000);
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconectado com sucesso');
});

module.exports = { connectDB, reconnectDB, isDBConnected };
