import { db } from '../db/database.js';
import { users } from '../db/schema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import 'dotenv/config';
import { eq } from 'drizzle-orm';



export const register = async (req, res) => {
   try {
    const { email, password, firstName, lastName } = req.body;
    
  
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.insert(users).values({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    }).returning({ id: users.id, email: users.email, role: users.role });

    const user = result[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email)).get();

    if(!user){
        return res.status(401).json({
            error : "Invalid email or password"
        })
       }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isValidPassword){
        return res.status(401).json({
            error : "Invalid email or password"
        })
       }

    const token = jwt.sign({ id: user.id, admin: user.admin }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
    res.status(200).json({
        message : 'User logged in',
        userData : {
            email : user.email,
            username : user.username,
            id: user.id,
        },
        token,
    })
  } catch (error) {
    console.error(error)
        res.status(500).json({
            error : 'Login failed',
            
        })
  }
};
