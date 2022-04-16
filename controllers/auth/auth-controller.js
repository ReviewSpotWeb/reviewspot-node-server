import bcrypt from "bcrypt";
import { User } from "../../models/user.js";

// TODO: Error(s) sent is handled the same way in all instances. Let's abstract it into its
// own function.

export const logout = async (req, res) => {
    if (!req.session.loggedIn) {
        res.status(400);
        res.json({
            errors: ["Logout failed; no user is currently logged in."],
        });
    }

    await req.session.destroy();
    res.sendStatus(200);
};

export const login = async (req, res) => {
    // TODO: Implement banning.
    if (req.session.loggedIn) {
        res.sendStatus(200);
    }
    if (req.body && (!req.body.username || !req.body.password)) {
        res.sendStatus(400);
        return;
    }

    const userToLogIn = await User.findOne({ username: req.body.username });
    if (!userToLogIn) {
        res.status(400);
        res.json({
            errors: [
                "A user with that username was not found. Please try again with the correct username.",
            ],
        });
        return;
    }

    const userPasswordHash = userToLogIn.password;
    const correctPassword = await bcrypt.compare(
        req.body.password,
        userPasswordHash
    );

    if (!correctPassword) {
        res.status(400);
        res.json({
            errors: ["The password provided was incorrect. Please try again."],
        });
        return;
    }

    // Need to know if a user is logged in for authorized features.
    // Similarly, we should store the current user's username so we can easily
    // check aspects of their account (e.g., role).
    req.session.loggedIn = true;
    req.session.username = userToLogIn.username;
    await req.session.save();

    res.sendStatus(200);
};

export const signUp = async (req, res) => {
    if (req.body && (!req.body.username || !req.body.password)) {
        res.sendStatus(400);
        return;
    }

    const usernameTaken = await User.exists({ username: req.body.username });
    if (usernameTaken) {
        res.json({
            errors: [
                "This username has already been taken. Please choose another one.",
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

    req.session.loggedIn = true;
    req.session.username = newUser.username;
    await req.session.save();

    res.json({ username: newUser.username });
    res.status(200);
};
