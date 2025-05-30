export default () => ({
    port: parseInt(process.env.PORT) || 3000,
    database: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-app',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
    email: {
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      service: process.env.EMAIL_SERVICE || 'gmail',
    },
  });



//   //export default () => ({
//   port: parseInt(process.env.PORT, 10) || 3000,
//   ton: {
//     endpoints: process.env.TON_ENDPOINTS?.split(',') || ['https://toncenter.com/api/v2/jsonRPC'],
//     apiKey: process.env.TON_API_KEY || '',
//   },
//   keyManagement: {
//     storageType: process.env.KEY_STORAGE_TYPE || 'encrypted-file',
//     encryptionKey: process.env.ENCRYPTION_KEY,
//     hsmConfig: {
//       enabled: process.env.HSM_ENABLED === 'true',
//       // Add HSM-specific config here
//     },
//   },
// });
