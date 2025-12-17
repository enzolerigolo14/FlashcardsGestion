import { db } from '../db/database.js';
import { collection } from '../db/schema.js';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const collectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  authorId: z.number().int(),
});

export const createCollection = async (req, res) => {
  try {
    const { name, description, authorId } = collectionSchema.parse(req.body);

    const newCollection = {
      name,
      description,
      authorId,
      creationDate: new Date().toISOString(),
    };

    await db.insert(collection).values(newCollection);

    res.status(201).send('Collection created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).send('Internal Server Error');
  }
};

export const getCollections = async (req, res) => {
  try {
    const collections = await db.select().from(collection);
    res.json(collections);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

export const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const collections = await db.select().from(collection).where(eq(collection.id, id));

    if (collections.length === 0) {
      return res.status(404).send('Collection not found');
    }

    res.json(collections[0]);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

export const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = collectionSchema.partial().parse(req.body);

    const updatedCollection = {      ...(name && { name }),
      ...(description && { description }),
    };

    const result = await db.update(collection).set(updatedCollection).where(eq(collection.id, id));

    if (result.rowsAffected === 0) {
      return res.status(404).send('Collection not found');
    }

    res.status(200).send('Collection updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).send('Internal Server Error');
  }
};

export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.delete(collection).where(eq(collection.id, id));

    if (result.rowsAffected === 0) {
      return res.status(404).send('Collection not found');
    }

    res.status(200).send('Collection deleted successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

      