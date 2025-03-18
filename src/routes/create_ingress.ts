

import express, { Request, Response } from 'express';
import { Controller, CreateIngressParams, } from '../lib/controller';


const router = express.Router();

router.post('/create_ingress', async (req: Request, res: Response) => {
    const controller = new Controller();

    try {
        const reqBody = req.body;
        const response = await controller.createIngress(
            reqBody as CreateIngressParams
          );

        res.json(response);
    } catch (err) {
        if (err instanceof Error) {
            res.json(err)
        }


    }

});

export default router;