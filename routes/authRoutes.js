import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/register' , async(req , res)=>{
    try {
        const { username , email , password } = req.body;
        if(!username || !email || !password){
            return res.status(400).json({message: "All fields are required"})
        }
        const exisistingUser = await prisma.user.findUnique({ where: { email } });
        if(exisistingUser){
            return res.status(400).json({message: "User already exists"})}

            const hashedPassword = await bcrypt.hash(password , 10); 
            
            await prisma.user.create({
                data: { username , email , password: hashedPassword }});
            res.status(201).json({message: "User registered successfully"}) 
            

    } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });    }
})



router.post('/login' , async(req,res)=>{
    try {
         const {email , password} = req.body;
    if(!email || !password){
        return res.status(400).json({message: "All fields are required"})
    }
    const user = await prisma.user.findUnique({where: {email}});
    if(!user){
        return res.status(400).json({message: "Invalid credentials ,This user does not exist"})
    }
    const isPasswordValid = await bcrypt.compare(password , user.password);
    if(!isPasswordValid){
        return res.status(400).json({message: "Invalid credentials , Wrong password"})
    }
    const token = jwt.sign({userId : user.id} , process.env.JWT_SECRET , {expiresIn: '1h'});
    res.json({token , user: { id: user.id , username: user.username , email: user.email}});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
    }
   
})
export default router;
