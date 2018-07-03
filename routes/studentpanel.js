const express = require("express");
const router = express.Router();
const Register = require('../Models/registermodel');
const passwordHash = require('password-hash');




router.post('/register',(req,res)=>{
    if(req.body.Password == req.body.CPassword){
        req.body.Password = passwordHash.generate(req.body.Password);
        req.body.CPassword = req.body.Password;
        Register.create(req.body,(err)=>{
            if(err) throw err;
            else{
          console.log('Data Inserted');
          res.render('/dashboard',{
              message : 'Registered Successfully'
          });
            }
        });
    }
else{
    console.log('Do not');
    res.render('/dashboard',{
        message : 'Password Does Not Match'
    });
}
});

router.post('/login',(req,res)=>{
    Register.findOne({'Email' : req.body.Email },(err,data)=>{
        if(err){
            res.redirect('/');
        }
       else{
           const result=passwordHash.verify(req.body.Password,data.Password);
           if(result){
               res.redirect('/dashboard');
           }
           else
           {
               res.redirect('/');
           }
       }

        
       
    });
});

module.exports = router;
