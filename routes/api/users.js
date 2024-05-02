const express = require('express');
const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);
const router = express.Router();
const { addUser, getUserByEmail } = require('../../service/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../../middlewares/authenticate');
const userLoggedIn = require('../../middlewares/userLoggedIn');
require('dotenv').config();

const userSchema = joi.object({
  email: joi.string().email().required(),
  password: joiPassword
    .string()
    .min(8)
    .minOfSpecialCharacters(1)
    .minOfLowercase(1)
    .minOfUppercase(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .onlyLatinCharacters()
    .doesNotInclude(["password", "12345678", "qwertyui"])
    .required(),
});

router.post("/signup", async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = userSchema.validate(body);
    const existingUser = await Users.findOne({ email: body.email });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: `Email ${body.email} is already in use` });
    }

    if (error) {
      const validatingErrorMessage = error.details[0].message;
      return res
        .status(400)
        .json({ message: `${validatingErrorMessage}` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    const addedUser = await addUser({
      email: body.email,
      password: hashedPassword,
    });
    res.json(addedUser);
    console.log("User signup successfully");
  } catch (error) {
    console.error("Error during signup: ", error);
    next();
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = userSchema.validate(body);

    if (error) {
      const validatingErrorMessage = error.details[0].message;
      return res
        .status(400)
        .json({ message: `${validatingErrorMessage}` });
    }

    const user = await getUserByEmail(body.email);

    if (!user) {
      return res
        .status(401)
        .json({ message: `Email or password is wrong` });
    }

    const validPassword = await bcrypt.compare(body.password, user.password);

    if (!validPassword) {
      return res
        .status(401)
        .json({ message: `Email or password is wrong` });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1y",
    });

    user.token = token;
    await user.save();

    res.json({
      token: `${user.token}`,
      user: {
        email: `${user.email}`,
        subscription: `${user.subscription}`,
      },
    });
    console.log("User login successfully");
    console.log("User token: ", user.token);
  } catch (error) {
    console.error("Error during login: ", error);
    next();
  }
});

router.get("/logout", authenticateToken, async (req, res, next) => {
  try {
    const user = req.user;

    if (!user || !user.token) {
      return res.status(401).json({ message: `Not authorized` });
    }

    user.token = null;
    await user.save();
    res.status(204).json({});
    console.log("User logout successfully");
    console.log("User token: ", user.token);
  } catch (error) {
    console.error("Error during logout: ", error);
    next();
  }
});

router.get("/current", [authenticateToken, userLoggedIn], async (req, res, next) => {
    try {
      const user = req.user;
      res.json({
        email: `${user.email}`,
        subscription: `${user.subscription}`,
      });
      console.log("User token: ", user.token);
    } catch (error) {
      console.error("Something went wrong: ", error);
      next();
    }
  }
);

module.exports = router