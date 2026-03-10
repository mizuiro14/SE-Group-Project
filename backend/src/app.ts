import express, { Application } from 'express';
import cors from 'cors';
// import userRoutes from './routes/userRoute';
// import gamesRoutes from './routes/gameRoute'
// import developerRoutes from './routes/developerRoutes'
// import genreRoutes from './routes/genreRoute'

const app: Application = express();

app.use(express.json());
app.use(cors());

// app.use('/api/users', userRoutes);
// app.use('/api/games', gamesRoutes);
// app.use('/api/developers', developerRoutes);
// app.use('/api/genres', genreRoutes);



export default app;