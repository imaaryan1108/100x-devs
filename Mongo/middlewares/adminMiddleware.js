export const adminAuthenticateMiddleware = async (req, res, next) => { 
    const { username, password } = req?.headers;
        const admin = await Admin.findOne({ username, password });
        if(!admin) {
            return res.status(403).json({ message: 'Unauthorized' });
    }   
    next()
}