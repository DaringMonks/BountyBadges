const express = require("express");
const router = express.Router();
// const Tutor = require("../Models/tutormodel");

router.get('/alogin',(req,res)=>{
     res.render('admin/alogin');
});

router.post('/alogin',(req,res)=>{
    const Username = req.body.Username;
    const Password = req.body.Password;
    if(Username == 'admin' && Password == 'admin')
    { 
        req.session.useradmin = Password;
        res.render('admin/dashboard',{
            code : 'front'
        });
    }
    else{
        res.redirect('/alogin');
    }
});

router.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/alogin');
});

router.get('/admin',(req,res)=>{
    if(!req.session.useradmin){
        res.redirect('/alogin');
    }else{
    res.render('admin/dashboard',{
        code : 'front'
    });
}
});

router.get('/admin/:page',(req,res)=>{
    pageCode = req.params.page;
    res.render('admin/dashboard',{
        code : pageCode
    });
});

router.post('/tutor',(req,res)=>{
    Tutor.create(req.body,(err,data)=>{
        if(data){
            console.log('Inserted');
            res.redirect('admin/dashboard');
        }
    });
});

module.exports = router;