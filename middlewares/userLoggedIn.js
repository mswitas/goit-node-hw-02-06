const userLoggedIn = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.token === null) {
      return res.status(401).json({ message: `Unauthorized attempt` });
    }

    next();
  } catch (error) {
    console.error("Something went wrong: ", error);
  }
};

module.exports = userLoggedIn;