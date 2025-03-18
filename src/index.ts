import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import createIngressRoute from './routes/create_ingress';
import createStreamRoute from './routes/create_stream';

dotenv.config();

const app = express();
const port = process.env.PORT || 6000;

app.use(express.json());
app.use('/api', createStreamRoute);
app.use('/api', createIngressRoute);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
