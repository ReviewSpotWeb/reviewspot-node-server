import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../../models/user.js";

export const login = null; //TODO: Implement.
export const signUp = async (req, res) => {
    console.log(req.body);
    if (req.body && (!req.body.username || !req.body.password)) {
        res.sendStatus(400);
        return;
    }

    const usernameTaken = await User.exists({ username: req.body.username });
    if (usernameTaken) {
        res.json({
            errors: [
                "Username has already been taken. Please write another one.",
            ],
        });
        res.status(400);
        return;
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
        username: req.body.username,
        password: passwordHash,
    });

    // TODO: Good way to handle a potential error here?
    await newUser.save();
    res.json({ username: newUser.username });
    res.status(200);
};
