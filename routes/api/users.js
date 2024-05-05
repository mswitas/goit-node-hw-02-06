const express = require('express');
const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);
const router = express.Router();
const { addUser, getUserByEmail, updateAvatarUrl, deleteTempAvatar, verifyUser } = require('../../service/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../../middlewares/authenticate');
const userLoggedIn = require('../../middlewares/userLoggedIn');
const gravatar = require('gravatar');
const multer = require('multer');
const jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const nanoid = require('nanoid-esm');
const mailer = require('../../mailer/mailer');
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

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, "./temp");
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + path.extname(file.originalname));
    },
    limits: {
        fileSize: 1048576,
    },
});

const upload = multer({ storage: storage });

router.post("/signup", async (req, res, next) => {
    try {
        const body = req.body;
        const { error } = userSchema.validate(body);
        const existingUser = await getUserByEmail(body.email);

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
    
        const avatarUrl = gravatar.url(body.email, {
            s: "250",
            r: "pg",
            d: "wavatar",
        }); 
        
        const verificationToken = nanoid();

        const addedUser = await addUser({
            email: body.email,
            password: hashedPassword,
            avatarUrl,
            verificationToken,
        });

        mailer.sendVerificationEmail(body.email, next, verificationToken);
      
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
            avatarUrl: `${user.avatarUrl}`,
        });
        
        console.log("User token: ", user.token);
    } catch (error) {
        console.error("Something went wrong: ", error);
        next();
    }
});

router.patch(
    "/avatars",
    [authenticateToken, userLoggedIn, upload.single("avatar")],
    async (req, res, next) => {
    try {
        const user = req.user;
        const file = req.file;
        // const { file, user } = request;

        const avatarUrl = `avatars/${user.id}-${Date.now()}-${file.originalname}`
            .toLowerCase()
            .replaceAll(" ", "-");

        await jimp
            .read(fs.readFileSync(file.path))
            .then((lenna) => {
            return lenna
                .resize(250, 250)
                .quality(80)
                .write(`./public/${avatarUrl}`);
            })
            .then(() => {
                updateAvatarUrl(user.id, avatarUrl);
                deleteTempAvatar(file.filename);
            return res.status(200).json({ avatarURL: `${avatarUrl}` });
            })
            .catch((err) => {
                console.error(err);
            });
    } catch (error) {
        console.error("The avatar has not been updated: ", error);
        next();
    }
});

router.get("/verify/:verificationToken", async (req, res, next) => {
    try {
        const { verificationToken } = req.params;
        const user = await verifyUser(verificationToken);

    if (user) {
        return res.status(200).json({ message: "Verification successful" });
    } else {
        next();
    }
    } catch (error) {
        console.error("Something went wrong: ", error);
        next();
    }
});

router.post("/verify", async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await getUserByEmail(email);

        if (!email) {
            return res
                .status(400)
                .json({ message: `Missing required field email` });
        }

        if (user.verify) {
            return res
                .status(400)
                .json({ message: `Verification has already been passed` });
        }

        mailer.sendVerificationEmail(user.email, next, user.verificationToken);
        return res
            .status(200)
            .json({ message: `Verification email sent again` });
    } catch (error) {
        console.error("Something went wrong: ", error);
        next();
    }
});

module.exports = router