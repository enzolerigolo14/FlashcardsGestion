import { db } from '../db/database.js';
import { user } from '../db/schema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { eq } from 'drizzle-orm';

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await db.select().from(user).where(eq(user.email, email)).get();
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.insert(user).values({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
      creationDate: new Date().toISOString(),
      admin: false
    }).returning({ id: user.id, email: user.email, admin: user.admin });

    const newUser = result[0];
    const token = jwt.sign({ id: newUser.id, email: newUser.email, admin: newUser.admin }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await db.select().from(user).where(eq(user.email, email)).get();

    if (!foundUser) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const token = jwt.sign({ id: foundUser.id, admin: foundUser.admin }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
    
    res.status(200).json({
      message: 'User logged in',
      userData: {
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        id: foundUser.id,
        admin: foundUser.admin
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Login failed',
    });
  }
};