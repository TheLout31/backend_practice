const jwt = require("jsonwebtoken");

const authMiddleware = (role) => {
  return (req, res, next) => {
    console.log("Token passed through to verify!!!!");

    const token = req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided. Please log in." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (decoded) {
        if (role.includes(decoded.role)) {
          req.user = decoded.userId; // store decoded data (e.g., userId) for later use
          next();
        } else {
          res.status(401).json({ message: "UnAuthorized." });
        }
      }
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
  };
};

module.exports = authMiddleware;
