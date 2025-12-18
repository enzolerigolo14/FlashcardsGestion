import express from 'express';
import authRoutes from './routes/authRouter.js';
import collectionRoutes from './routes/collectionRouter.js';
import flashcardRoutes from './routes/flashcardRouter.js';
import adminRoutes from './routes/adminRouter.js';

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/collections', collectionRoutes);
app.use('/flashcards', flashcardRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
