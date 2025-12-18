import { db } from '../db/database.js';
import { collection, flashcard } from '../db/schema.js';
import { eq, and, like, desc } from 'drizzle-orm';

export const createCollection = async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;
    const userId = req.user.id;

    const result = await db.insert(collection).values({
      userId,
      title,
      description,
      isPublic: isPublic || false,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
};

export const getCollection = async (req, res) => {
  try {
    const collectionId = parseInt(req.params.id);
    if (isNaN(collectionId)) {
      return res.status(400).json({ error: 'Invalid collection ID' });
    }
    const userId = req.user.id;

    const foundCollection = await db.select().from(collection).where(eq(collection.id, collectionId)).get();

    if (!foundCollection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (foundCollection.isPublic || foundCollection.userId === userId || isAdmin) {
      return res.json(foundCollection);
    }

    res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve collection' });
  }
};

export const getMyCollections = async (req, res) => {
  try {
    const userId = req.user.id;
    const collections = await db.select().from(collection).where(eq(collection.userId, userId));
    res.json(collections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve collections' });
  }
};

export const getPublicCollections = async (req, res) => {
  try {
    const { search } = req.query;
    let query = db.select().from(collection).where(eq(collection.isPublic, true));

    if (search) {
      query = db.select().from(collection).where(
        and(
            eq(collection.isPublic, true),
            like(collection.title, `%${search}%`)
        )
      );
    }
    const collections = await query.all();

    res.json(collections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search collections' });
  }
};

export const updateCollection = async (req, res) => {
  try {
    const collectionId = parseInt(req.params.id);
    if (isNaN(collectionId)) {
      return res.status(400).json({ error: 'Invalid collection ID' });
    }
    const userId = req.user.id;
    const { title, description, isPublic } = req.body;

    const existingCollection = await db.select().from(collection).where(eq(collection.id, collectionId)).get();

    if (!existingCollection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (existingCollection.userId !== userId) {
      return res.status(403).json({ error: 'Only the owner can update this collection' });
    }

    const updatedCollection = await db.update(collection)
      .set({ title, description, isPublic })
      .where(eq(collection.id, collectionId))
      .returning();

    res.json(updatedCollection[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
};

export const deleteCollection = async (req, res) => {
  try {
    const collectionId = parseInt(req.params.id);
    if (isNaN(collectionId)) {
      return res.status(400).json({ error: 'Invalid collection ID' });
    }
    const userId = req.user.id;

    const existingCollection = await db.select().from(collection).where(eq(collection.id, collectionId)).get();

    if (!existingCollection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (existingCollection.userId !== userId) {
      return res.status(403).json({ error: 'Only the owner can delete this collection' });
    }


    await db.delete(flashcard).where(eq(flashcard.collectionId, collectionId));

    await db.delete(collection).where(eq(collection.id, collectionId));

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
};