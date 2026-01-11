import { Router } from 'express';
import { getAllUsers, getUser, deleteUser } from '../controllers/adminController.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateToken, isAdmin);

router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.delete('/users/:id', deleteUser);

export default router;
