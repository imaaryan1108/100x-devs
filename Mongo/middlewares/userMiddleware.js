import { User } from "../db/schema";

export const userExistsMiddleware = async (req, res, next) => { 
    const { username } = req.body || req?.headers;
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
    next()
}

export const authenticateUserMiddleware = async (req, res, next) => { 
    const { username, password } = req?.headers;
        const user = await User.findOne({ username, password });
        if(!user) {
            return res.status(403).json({ message: 'Unauthorized' });
    }   
    next()
}