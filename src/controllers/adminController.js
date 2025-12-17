import { db } from '../db/database.js';
import { user } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import 'dotenv/config' 


/**
 * 
 * @param { request } req
 * @param { response} res
 */


export const getAllUsers = async (req, res) => {
   try {
        const result = await db.select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
            createdAt: users.createdAt
        }).from(users).orderBy(desc(users.createdAt)).all();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * 
 * @param { request } req
 * @param { response} res
 */


export const getUser = async (req, res) => {
  const id = parseInt(req.params.id);
    if(isNaN(id)) return res.status(400).json({error: "Invalid ID"});

    try {
        const user = await db.select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
            createdAt: users.createdAt
        }).from(users).where(eq(users.id, id)).get();
        
        if(!user) return res.status(404).json({error: "User not found"});
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * 
 * @param { request } req
 * @param { response} res
 */


export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.delete(user).where(eq(user.id, id));

    if (result.rowsAffected === 0) {
      return res.status(404).send('User not found');
    }

    res.status(200).send('User deleted successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};
