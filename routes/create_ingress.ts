import express from 'express';

const router = express.Router();

router.post('/create-ingress', (req, res) => {
    // Your logic to handle the request goes here
    res.send('Ingress created successfully');
});

export default router;