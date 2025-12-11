
import { db } from './database.js';
import { user , collection, flashcard, flashcardsProgress} from './schema.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

async function main() {
  console.log('Seeding database...');

  // Hashing passwords
  const hashedPassword1 = await bcrypt.hash('password123', saltRounds);
  const hashedPassword2 = await bcrypt.hash('password456', saltRounds);

  // Users
  const users = await db.insert(user).values([
    {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword1,
      admin: 1,
      creationDate: new Date().toISOString(),
    },
    {
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        password: hashedPassword2,
        admin: 0,
        creationDate: new Date().toISOString(),
      },
  ]).returning();

  // Collections
  const collections = await db.insert(collection).values([
    {
      userId: users[0].id,
      title: 'Capitales du Monde',
      description: 'Apprenez les capitales des pays du monde.',
      isPublic: 1,
    },
    {
      userId: users[1].id,
      title: 'Vocabulaire Anglais',
      description: 'Mots de vocabulaire de base en anglais.',
      isPublic: 0,
    },
  ]).returning();

  // Flashcards
  const flashcards = await db.insert(flashcard).values([
    {
      collectionId: collections[0].id,
      frontText: 'France',
      backText: 'Paris',
    },
    {
        collectionId: collections[0].id,
        frontText: 'Japon',
        backText: 'Tokyo',
      },
      {
        collectionId: collections[1].id,
        frontText: 'Hello',
        backText: 'Bonjour',
      },
      {
        collectionId: collections[1].id,
        frontText: 'Goodbye',
        backText: 'Au revoir',
      },
  ]).returning();

  // flashcardsProgress
  await db.insert(flashcardsProgress).values([
    {
      userId: users[0].id,
      flashCardId: flashcards[0].id,
      level: 2,
      lastReviewDate: new Date().toISOString(),
      nextReviewDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        userId: users[0].id,
        flashCardId: flashcards[1].id,
        level: 4,
        lastReviewDate: new Date().toISOString(),
        nextReviewDate: new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: users[1].id,
        flashCardId: flashcards[2].id,
        level: 1,
        lastReviewDate: new Date().toISOString(),
        nextReviewDate: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId: users[1].id,
        flashCardId: flashcards[3].id,
        level: 0,
        lastReviewDate: new Date().toISOString(),
        nextReviewDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
      },
  ]);

  console.log('Database seeded successfully!');
}

main().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
