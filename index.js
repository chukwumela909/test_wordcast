const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const userRoutes = require('./routes/user');
const livestreamRoutes = require('./routes/livestream');



const app = express();
app.use(express.json());

mongoose.connect('mongodb+srv://amirizew:0HTwexCkSckakIPL@cluster0.atoor.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/livestreams', livestreamRoutes);
app.get('/api/test', (req, res) => {
        res.send('Test endpoint is working!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
});
