import { db } from '../db/database.js';
import { user } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import 'dotenv/config' 


/**
 * 
 * @param { request } req
 * @param { response} res
 */


export const getAllUsers = async (req, res) => {
   try {
        const result = await db.select({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            admin: user.admin,
            creationDate: user.creationDate
        }).from(user).orderBy(desc(user.creationDate)).all();
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
        const foundUser = await db.select({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            admin: user.admin,
            creationDate: user.creationDate
        }).from(user).where(eq(user.id, id)).get();
        
        if(!foundUser) return res.status(404).json({error: "User not found"});
        res.json(foundUser);
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
