const jwt = require('jsonwebtoken')


const protect = async (req, res, next) => {
    let authtoken = req.headers['x-access-token']
     
//    console.log(authtoken)


    jwt.verify(authtoken, "privatekey", (err, decoded) => {
        if (err) {
            return res.json({ error: true , message: "Unauthorized!" });
        }
        // res.send("authorized")
        req.user = decoded.id;
        next();
    });

    if (!authtoken) {
        console.log("no token");
    }

};




module.exports = { protect }