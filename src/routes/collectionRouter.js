import { Router } from 'express';
import { createCollection, getCollection, getMyCollections, getPublicCollections, updateCollection, deleteCollection } from '../controllers/collectionController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validation.js';
import { createCollectionSchema, updateCollectionSchema } from '../models/collection.js';

const router = Router();

router.use(authenticateToken);

router.post('/', validateBody(createCollectionSchema), createCollection);
router.get('/my', getMyCollections);
router.get('/public', getPublicCollections);
router.get('/:id', getCollection);
router.put('/:id', validateBody(updateCollectionSchema), updateCollection);
router.delete('/:id', deleteCollection);

export default router;
