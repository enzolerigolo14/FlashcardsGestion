import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';




export const user = sqliteTable('user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  firstName: text('firstName'),
  lastName: text('lastName'),
  password: text('password'),
  admin: integer({mode: 'boolean' , name: 'admin'}).notNull().default(false),
  creationDate: text('creationDate').notNull()
});

export const collection = sqliteTable('collections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('userId').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  isPublic: integer({mode: 'boolean' , name: 'isPublic'}).notNull().default(false)
});

export const flashcard = sqliteTable('flashcards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  collectionId: integer('collectionId').notNull(),
  frontText: text('frontText').notNull(),
  backText: text('backText'),
  frontUrl: text('frontUrl'),
  backUrl: text('backUrl')
});

export const flashcardsProgress = sqliteTable('flashcardsProgress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('userId').notNull(),
  flashCardId: integer('flashCardId').notNull(),
  level: integer('level').notNull().default(0),
  lastReviewDate: text('lastReviewDate'),
  nextReviewDate: text('nextReviewDate')
});
