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

// const timeStamp = Math.round(Date.now() / 1000);
// const timeStampInMilliseconds = Date.now();
// const appId = 486156498;
// const serverSecret = 'b849b631636b018288a3712a2a51c4f3';
// const signatureNonce = crypto.randomBytes(8).toString('hex');

// function GenerateUASignature(appId, signatureNonce, serverSecret, timeStamp) {
//         const hash = crypto.createHash('md5'); // Use the MD5 hashing algorithm.
//         const str = appId + signatureNonce + serverSecret + timeStamp;
//         hash.update(str);
//         // hash.digest('hex') indicates that the output is in hex format 
//         return hash.digest('hex');
// }

// const signature = GenerateUASignature(appId, signatureNonce, serverSecret, timeStamp);

// console.log(signatureNonce);

// console.log(timeStamp);

// console.log(signature);

// console.log(`Timestamp in milliseconds: ${timeStampInMilliseconds}`);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
});
