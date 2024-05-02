const jwt = require("jsonwebtoken");
const User = require("../service/schemas/users");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: `Not authorized` });
  }

  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verify.id);
    request.user = user;
    next();
  } catch (error) {
    console.error("Error during authentification: ", error);
    res.status(401).json({ message: `Not authorized` });
  }
};

module.exports = authenticateToken;