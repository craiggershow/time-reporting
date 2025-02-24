import { app } from './app';
import { prisma } from './lib/prisma';

const port = process.env.PORT || 8000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✓ Connected to database');

    app.listen(port, () => {
      console.log(`✓ Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 