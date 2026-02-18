import * as userModel from "../models/userModel.js";

export const getUsers = async (req, res, next) => {
    try{
        const users = await userModel.getAllUsers();
        res.json(users);
    }catch (err){
        next(err);
    }
};

export const getUser = async (req, res, next) => {
    try{
        const user = await userModel.getUserById(req.params.id);
        if (!user) return res.status(404).json({error: "User not found"});
        res.json(user);
    }catch (err){
        next(err);
    }
};