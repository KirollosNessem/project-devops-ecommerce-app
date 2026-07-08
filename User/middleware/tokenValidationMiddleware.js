const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "user is not authorized" });
            }
            req.user = decoded.user;
            next();
        });
    } else {
        return res.status(401).json({ message: "no token provided, authorization denied" });
    }
});

module.exports = validateToken;