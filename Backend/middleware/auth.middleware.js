import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";


export const authUser=async(req,res,next)=>{
    try{
        const token=req.cookies.token || req.header('Authorization').split(' ')[1]
        if (!token){
            return res.status(401).send({error:'Please authenticate'})
        }
        const isBlackListed=await redisClient.get(token)

        if (isBlackListed){
            res.cookie('token','','')
            return res.status(401).send({error:'Please authenticate'})
        }


        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded
        next()
    } catch (error) {
        res.status(401).send({error:'Please authenticate'})
    }
}