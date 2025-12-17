import { db } from '../db/database.js';
import { flashcard } from '../db/schema.js';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const flashcardSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  collectionId: z.number().int(),
});

export const createFlashcard = async (req, res) => {
  try {
    const { question, answer, collectionId } = flashcardSchema.parse(req.body);

    const newFlashcard = {
      question,
      answer,
      collectionId,
      creationDate: new Date().toISOString(),
    };

    await db.insert(flashcard).values(newFlashcard);

    res.status(201).send('Flashcard created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).send('Internal Server Error');
  }
};

export const getFlashcards = async (req, res) => {
  try {
    const flashcards = await db.select().from(flashcard);
    res.json(flashcards);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

export const getFlashcardById = async (req, res) => {
  try {
    const { id } = req.params;
    const flashcards = await db.select().from(flashcard).where(eq(flashcard.id, id));

    if (flashcards.length === 0) {
      return res.status(404).send('Flashcard not found');
    }

    res.json(flashcards[0]);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

export const updateFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, collectionId } = flashcardSchema.partial().parse(req.body);

    const updatedFlashcard = {
      ...(question && { question }),
      ...(answer && { answer }),
      ...(collectionId && { collectionId }),
    };

    const result = await db.update(flashcard).set(updatedFlashcard).where(eq(flashcard.id, id));

    if (result.rowsAffected === 0) {
      return res.status(404).send('Flashcard not found');
    }

    res.status(200).send('Flashcard updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).send('Internal Server Error');
  }
};

export const deleteFlashcard = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.delete(flashcard).where(eq(flashcard.id, id));

    if (result.rowsAffected === 0) {
      return res.status(404).send('Flashcard not found');
    }

    res.status(200).send('Flashcard deleted successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};
