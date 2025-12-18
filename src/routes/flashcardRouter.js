import { Router } from 'express';
import { createFlashcard, getFlashcard, getCollectionFlashcards, getFlashcardsToReview, updateFlashcard, deleteFlashcard, reviewFlashcard } from '../controllers/flashcardController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validation.js';
import { createFlashcardSchema, updateFlashcardSchema, reviewFlashcardSchema } from '../models/flashcard.js';

const router = Router();

router.use(authenticateToken);

router.post('/', validateBody(createFlashcardSchema), createFlashcard);
router.get('/collection/:collectionId', getCollectionFlashcards);
router.get('/collection/:collectionId/review', getFlashcardsToReview);
router.get('/:id', getFlashcard);
router.put('/:id', validateBody(updateFlashcardSchema), updateFlashcard);
router.delete('/:id', deleteFlashcard);
router.post('/:id/review', validateBody(reviewFlashcardSchema), reviewFlashcard);

export default router;
