import bcrypt from "bcrypt";
import { User } from "../../models/user.js";

// TODO: Error(s) sent is handled the same way in all instances. Let's abstract it into its
// own function.

export const logout = async (req, res) => {
    if (!req.session.currentUser) {
        res.status(400);
        res.json({
            errors: ["Logout failed; no user is currently logged in."],
        });
    }

    try {
        await req.session.destroy();
        res.status(200);
    } catch (error) {
        res.status(500);
        res.json({
            errors: [
                "Error destroying the user session. Please contact a site contributor.",
            ],
        });
    }
};

export const login = async (req, res) => {
    // TODO: Implement banning.
    console.log(req.session);
    if (req.session.currentUser) {
        res.sendStatus(200);
    }
    if (req.body && (!req.body.username || !req.body.password)) {
        res.sendStatus(400);
        return;
    }

    try {
        const userToLogIn = await User.findOne({ username: req.body.username });
    } catch (error) {
        res.status(500);
        res.json({ errors: [error.message] });
        return;
    }

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
    try {
        req.session.currentUser = userToLogIn;
        await req.session.save();
    } catch (error) {
        res.status(500);
        res.json({
            errors: [
                "Could not properly save the user session. Please try again or contact a site contributor.",
            ],
        });
    }

    res.status(200);
    res.json({
        username: userToLogIn.username,
        role: userToLogIn.role,
    });
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

    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hashSync(req.body.password, salt);
    } catch (error) {
        res.status(500);
        res.json({
            errors: [
                "Error processing the given password. Please reach out to a site contributer.",
            ],
        });
        return;
    }

    try {
        const newUser = new User({
            username: req.body.username,
            password: passwordHash,
        });
        await newUser.save();
    } catch (error) {
        res.status(500);
        res.json({
            errors: [
                "Could not create a User with the given information. Please contact a site contributor. ",
            ],
        });
        return;
    }

    try {
        req.session.currentUser = newUser;
        await req.session.save();
    } catch (error) {
        res.status(500);
        res.json({
            errors: [
                "Could not properly save your session. Please contact a site contributor.",
            ],
        });
        return;
    }

    res.json({ username: newUser.username, role: newUser.role });
    res.status(200);
};
