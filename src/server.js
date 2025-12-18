import express from 'express';
import authRoutes from './routes/authRouter.js';
import collectionRoutes from './routes/collectionRouter.js';


const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/collections', collectionRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
