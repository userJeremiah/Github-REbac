import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testPermitConnection } from './config/permit';
import { testDatabaseConnection, initializeDatabase } from './config/database';
import repositoryRoutes from './routes/repositories';
import teamRoutes from './routes/teams';
import pullRequestRoutes from './routes/pullRequests';
import aiRoutes from './routes/ai';
import visualizationRoutes from './routes/visualization';
import { auditLog } from './middleware/auditLog';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Temporarily disabled audit log for testing
// app.use(auditLog);

app.use('/api/repositories', repositoryRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/pull-requests', pullRequestRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/visualization', visualizationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

async function start() {
  try {
    // Initialize SQLite database (creates tables automatically)
    if (initializeDatabase) {
      initializeDatabase();
    }
    
    await testDatabaseConnection();
    await testPermitConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
