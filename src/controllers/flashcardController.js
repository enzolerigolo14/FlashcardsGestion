import { db } from '../db/database.js';
import { flashcard, collection, flashcardsProgress } from '../db/schema.js';
import { eq, and, lte } from 'drizzle-orm';

export const createFlashcard = async (req, res) => {
  try {
    const { collectionId, frontText, backText, frontUrl, backUrl } = req.body;
    const userId = req.user.id;

    const col = await db.select().from(collection).where(eq(collection.id, collectionId)).get();
    if (!col) return res.status(404).json({ error: 'Collection not found' });
    if (col.userId !== userId) return res.status(403).json({ error: 'Not owner of collection' });

    const result = await db.insert(flashcard).values({
      collectionId,
      frontText,
      backText,
      frontUrl,
      backUrl
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create flashcard' });
  }
};

export const getFlashcard = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid flashcard ID' });
    const userId = req.user.id;

    const card = await db.select().from(flashcard).where(eq(flashcard.id, id)).get();
    if (!card) return res.status(404).json({ error: 'Flashcard not found' });

    const col = await db.select().from(collection).where(eq(collection.id, card.collectionId)).get();
    
    if (col.isPublic || col.userId === userId || isAdmin) {
      return res.json(card);
    }

    res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get flashcard' });
  }
};

export const getCollectionFlashcards = async (req, res) => {
  try {
    const collectionId = parseInt(req.params.collectionId);
    if (isNaN(collectionId)) return res.status(400).json({ error: 'Invalid collection ID' });
    const userId = req.user.id;
    const isAdmin = req.user.admin;

    const col = await db.select().from(collection).where(eq(collection.id, collectionId)).get();
    if (!col) return res.status(404).json({ error: 'Collection not found' });

    if (!col.isPublic && col.userId !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const cards = await db.select().from(flashcard).where(eq(flashcard.collectionId, collectionId));
    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to list flashcards' });
  }
};

export const getFlashcardsToReview = async (req, res) => {
  try {
    const collectionId = parseInt(req.params.collectionId);
    if (isNaN(collectionId)) return res.status(400).json({ error: 'Invalid collection ID' });
    const userId = req.user.id;
    const isAdmin = req.user.admin;

    const col = await db.select().from(collection).where(eq(collection.id, collectionId)).get();
    if (!col) return res.status(404).json({ error: 'Collection not found' });
    if (!col.isPublic && col.userId !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const cards = await db.select().from(flashcard).where(eq(flashcard.collectionId, collectionId)).all();
    const now = new Date().toISOString();
    const result = [];

    for (const card of cards) {
        const progress = await db.select().from(flashcardsProgress)
            .where(and(
                eq(flashcardsProgress.userId, userId),
                eq(flashcardsProgress.flashCardId, card.id)
            )).get();

        if (progress) {
            if (progress.nextReviewDate && progress.nextReviewDate <= now) {
                result.push(card);
            }
        } else {
            result.push(card);
        }
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get review list' });
  }
};

export const updateFlashcard = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid flashcard ID' });
    const userId = req.user.id;
    const { frontText, backText, frontUrl, backUrl } = req.body;

    const card = await db.select().from(flashcard).where(eq(flashcard.id, id)).get();
    if (!card) return res.status(404).json({ error: 'Flashcard not found' });

    const col = await db.select().from(collection).where(eq(collection.id, card.collectionId)).get();
    if (col.userId !== userId) return res.status(403).json({ error: 'Only owner can update' });

    const updated = await db.update(flashcard)
      .set({ frontText, backText, frontUrl, backUrl })
      .where(eq(flashcard.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
};

export const deleteFlashcard = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid flashcard ID' });
    const userId = req.user.id;

    const card = await db.select().from(flashcard).where(eq(flashcard.id, id)).get();
    if (!card) return res.status(404).json({ error: 'Flashcard not found' });

    const col = await db.select().from(collection).where(eq(collection.id, card.collectionId)).get();
    if (col.userId !== userId) return res.status(403).json({ error: 'Only owner can delete' });

    await db.delete(flashcardsProgress).where(eq(flashcardsProgress.flashCardId, id));
    await db.delete(flashcard).where(eq(flashcard.id, id));

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
};

export const reviewFlashcard = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid flashcard ID' });
    const userId = req.user.id;
    const { success } = req.body;

    const card = await db.select().from(flashcard).where(eq(flashcard.id, id)).get();
    if (!card) return res.status(404).json({ error: 'Flashcard not found' });

    const col = await db.select().from(collection).where(eq(collection.id, card.collectionId)).get();
    if (!col.isPublic && col.userId !== userId) return res.status(403).json({ error: 'Access denied' });

    let progress = await db.select().from(flashcardsProgress)
        .where(and(
            eq(flashcardsProgress.userId, userId),
            eq(flashcardsProgress.flashCardId, id)
        )).get();

    let currentLevel = progress ? progress.level : 0;
    let newLevel = 1;
    let daysToAdd = 1;

    if (success) {
        newLevel = currentLevel + 1;
        if (newLevel > 5) newLevel = 5;
    } else {
        newLevel = 1;
    }

    switch (newLevel) {
        case 1: daysToAdd = 1; break;
        case 2: daysToAdd = 2; break;
        case 3: daysToAdd = 4; break;
        case 4: daysToAdd = 8; break;
        case 5: daysToAdd = 16; break;
    }

    const now = new Date();
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + daysToAdd);

    if (progress) {
        await db.update(flashcardsProgress).set({
            level: newLevel,
            lastReviewDate: now.toISOString(),
            nextReviewDate: nextReview.toISOString()
        }).where(eq(flashcardsProgress.id, progress.id));
    } else {
        await db.insert(flashcardsProgress).values({
            userId,
            flashCardId: id,
            level: newLevel,
            lastReviewDate: now.toISOString(),
            nextReviewDate: nextReview.toISOString()
        });
    }

    res.json({ message: 'Review recorded', level: newLevel, nextReviewDate: nextReview.toISOString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record review' });
  }
};