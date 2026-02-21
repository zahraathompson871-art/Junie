import * as userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

export const createUser = async (req, res, next) => {
    try{
        const {full_name, email, password} = req.body;


        if (!full_name || !email || !password){
            return res.status(400).json({error:"All fields are required"});
        }

        const password_hash= await bcrypt.hash(password,10);

        const newUser = await userModel.createUser({full_name, email, password_hash});
        
        res.status(201).json(newUser);
    }catch (err){
        next(err);
    }
};

export const deleteUserByEmail = async (req,res,next) => {
    try {
        const {email} = req.body;

        if (!email){
            return res.status(400).json({error: "Email is required"});
        }

        const deleted = await userModel.deleteUserByEmail(email);

        if(!deleted){
            return res.status(404).json({error:"User not found"});
        }

        res.status(200).json({message:"User deleted successfully"});
    }catch(err){
        next(err)
    }
};

export const loginUser = async (req, res, next) => {
    try{
        const {email, password} = req.body;

        if (!email || !password){
            return res.status(400).json({error: "Email and password required"});
        }

        const user = await userModel.getUserByEmail(email);

        if (!user){
            return res.status(401).json({error: "Invalid credentials"})
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch){
            return res.status(401).json({error: "Invalid credentials"});
        }

        const token = jwt.sign(
            {id: user.user_id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );
        
        res.status(200).json({
            message:"Login successful",
            token
        });
    }catch (err){
        next(err);
    }
}