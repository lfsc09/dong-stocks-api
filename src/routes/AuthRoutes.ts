import { Router } from 'express';
import { authenticateUser } from '../Controllers/AuthController';
import { authenticateHandleData } from '../Validators/UserValidators';

const router = Router();

// Authentication route
router.post('/auth', authenticateHandleData, authenticateUser);

export default router;
