const express = require("express");
const router = express.Router();
const Register = require('../Models/registermodel');
const Query = require('../Models/querymodel');
const passwordHash = require('password-hash');
const Challenge = require("../Models/challengemodel");


router.get('/',async(req,res)=>{
   const challenge = await Challenge.find().sort({'_id' : -1}).limit(4);
   if(challenge){
    res.render('landing',{
        Challenge : challenge
    });}});

module.exports = router;
