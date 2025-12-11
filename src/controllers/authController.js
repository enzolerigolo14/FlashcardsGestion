import { db } from '../db/database.js';
import { user } from '../db/schema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import 'dotenv/config';
import { eq } from 'drizzle-orm';

const signupSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8),
});

export const signup = async (req, res) => {
  try {
    const { email, firstName, lastName, password } = signupSchema.parse(req.body);

    const existingUser = await db.select().from(user).where(eq(user.email, email));

    if (existingUser.length > 0) {
      return res.status(409).send('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      firstName,
      lastName,
      password: hashedPassword,
      creationDate: new Date().toISOString(),
    };

    await db.insert(user).values(newUser);

    res.status(201).send('User created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).send('Internal Server Error');
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string(),
    }).parse(req.body);

    const users = await db.select().from(user).where(eq(user.email, email));

    if (users.length === 0) {
      return res.status(404).send('User not found');
    }
    const foundUser = users[0];

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    if (!isPasswordValid) {
      return res.status(401).send('Invalid password');
    }

    const token = jwt.sign({ id: foundUser.id, admin: foundUser.admin }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).send('Internal Server Error');
  }
};
