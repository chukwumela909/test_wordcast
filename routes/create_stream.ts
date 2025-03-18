import express, { Request, Response } from 'express';
import { Controller, CreateStreamParams } from '../lib/controller';


const router = express.Router();

router.post('/create_stream', async (req: Request, res: Response) => {
    const controller = new Controller();

    try {
        const reqBody = req.body;
        const response = await controller.createStream(
            reqBody as CreateStreamParams
        );

        res.json(response);
    } catch (err) {
        if (err instanceof Error) {
            res.json(err)
        }


    }

});

export default router;