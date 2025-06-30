const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const authRoutes = require('./routes/auth');
const livestreamRoutes = require('./routes/livestream');
const userRoutes = require('./routes/user');
const path = require('path');




const app = express();
app.use(express.json());

mongoose.connect('mongodb+srv://amirizew:0HTwexCkSckakIPL@cluster0.atoor.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/livestream', livestreamRoutes);


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
});
