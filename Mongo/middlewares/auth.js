// TODO: Add JWT Authentication 

export const authenticateMiddleware = async (req, res, next) => {
    const { authorization } = req?.headers?.authorization;
    try {
        const decode = jwt.verify(authorization, process.env.JWT_SECRET);
        if (decode.username) {
            next();
        }
    } catch (error) { 
        return res.status(403).json({ message: 'Unauthorized' });
    }
    next();
}