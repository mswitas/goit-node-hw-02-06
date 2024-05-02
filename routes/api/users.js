const express = require('express');
const Joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);
const router = express.Router();
const Users = require('../../service/schemas/users');
const { addUser } = require('../../service/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

router.post("/users/login", async (req, res, next) => {
  try {
    const body = req.body;
    const { error } = userSchema.validate(body);

    if (error) {
      const validatingErrorMessage = error.details[0].message;
      return res
        .status(400)
        .json({ message: `${validatingErrorMessage}` });
    }

    const user = await Users.findOne({ email: body.email });

    if (!user) {
      return response
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