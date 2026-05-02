import express from 'express';
import { 
  runAgentController, 
  getAgentLogsController, 
  getPromptsController, 
  updatePromptsController 
} from '../../controllers/agentController.js';

const router = express.Router();

router.post('/', runAgentController);
router.get('/prompts', getPromptsController);
router.put('/prompts', updatePromptsController);
router.get('/:projectId/logs', getAgentLogsController);

export default router;
