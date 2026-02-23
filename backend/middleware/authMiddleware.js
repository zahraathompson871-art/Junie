import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startWith("Bearer")){
            return res.status(401).json({error:"Not authorized"});
        }
        const token = authHeader.spli("")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = { id: decoded.id, email: decoded.email};

        next();
    }catch(err){
        res.status(401).json({error: "Invalid or expired token"});
    }
};