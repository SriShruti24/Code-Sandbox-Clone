import express from 'express';
import projectRouter from './projects.js';
import agentRouter from './agent.js';
const router = express.Router();

router.use('/projects', projectRouter);

router.use('/agent', agentRouter);

export default router;