module.exports = ({ config }) => {
  // Load env variables
  require('dotenv').config();

  return {
    ...config,
    extra: {
      apiUrl: process.env.API_BASE_URL,
      apiPort: process.env.API_PORT,
      enableDebugMode: process.env.ENABLE_DEBUG_MODE === 'true',
      eas: {
        projectId: "your-project-id"
      }
    },
  };
}; 