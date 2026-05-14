const jwt = require('jsonwebtoken')

const verifyToken = async (req, res, next) => {
  try {
    const token = await req.cookies?.token;
    console.log("token=>", token);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized you are not logged In" });
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token signature." });
    } else if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    } else {
      return res.status(401).json({ message: "Authentication failed." });
    }
  }
};

module.exports = verifyToken;