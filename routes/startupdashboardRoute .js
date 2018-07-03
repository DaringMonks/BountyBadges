const express = require("express");
const router = express.Router();
const Register = require("../Models/registermodel");
const Challenge = require("../Models/challengemodel");
const Submission = require("../Models/challengesubmissionmodel");
const Skill = require("../Models/skillsmodel");
const Startup = require("../Models/startupmodel");
const passwordHash = require('password-hash');
const Professor = require("../Models/professormodel");
const Project = require("../Models/projectsmodel");
const Participate = require("../Models/participatemodel");
const Interest = require("../Models/interestsmodel");
const Education = require("../Models/educationsmodel");
const Objective = require("../Models/objectsmodel");
const randomstring = require("randomstring");
const path = require('path');
var fs = require('fs');
var ejs = require('ejs');
var pdf = require('html-pdf');
var phantom = require('phantom');  
var pdf = require('dynamic-html-pdf');


const multer = require("multer");
const multerConf = {
  storage : multer.diskStorage({
    destination : function(req,file,next){
      next(null,'./public/uploads');
    },
    filename : function(req,file,next){
      next(null,file.originalname);
    }
  })
};
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    service : 'gmail',
    secure : false,
    port : 25,
    auth : {
        user : 'sid.sam02@gmail.com',
        pass : 'theunder'
    },
    tls : {
        rejectUnauthorized : false
    }});


router.get('/Sdashboard',async(req,res,next)=>{
    res.render('startupdashboard/startupdashboard');
});

router.post('/Sregister',multer(multerConf).single('ProfileImage'),(req,res)=>{
    if(req.body.Password == req.body.CPassword){
        req.body.Password = passwordHash.generate(req.body.Password);
        req.body.CPassword = req.body.Password;
        req.body.ProfileImage = './uploads/'+req.file.filename;
        req.body.Auth = 'No';
        req.body.Code = '';
        var code =  randomstring.generate({
            length: 12,
            charset: 'alphabetic'
          });
          req.body.authCode = code;
        Startup.create(req.body,(err)=>{
            if(err)
            {
                res.render('studentdashboard/startupdashboard',{
                    message : 'Registration Unsuccessfull'
                });
            }
            else{
                var Url = req.protocol + '://' + req.get('host') + req.originalUrl;
                var fullUrl = Url+'/'+'auth/'+req.body.Email+'/'+code;
             let HelperOptions ={
                from : config.EmailCredentials.Name+ '<'+config.EmailCredentials.Id ,
                to : req.body.Email,
                 subject : "Scholar Credits",
                 text : "Please Authenticate Your Profile By Clicking the link "+fullUrl
             }

             transporter.sendMail(HelperOptions,(err,info)=>{
                 if(err) throw err;
                 console.log("The message was sent");
             });

          res.render('startupdashboard/startupdashboard',{
              message : 'Registered Successfully'
          });
            }
        });
    }
else{
    console.log('Do not');
    res.render('startupdashboard/startupdashboard');
}
});

router.get('/Sregister/auth/:email/:code',async(req,res)=>{
    const data = await Startup.update({'Email':req.params.email,'authCode':req.params.code},{'Auth':'Yes'});
if(data){
   res.render('startupdashboard/startupdashboard',{
       message : 'Your Profile Has Been Authenticated,You Can Login Now'
   });
}
});


router.get('/Sregister',(req,res)=>{
    res.redirect('/Sdashboard');
});

router.get('/Slogin',(req,res)=>{
    res.redirect('/Sdashboard');
});

router.post('/Slogin',(req,res)=>{
    const email = req.body.Email;
    const password = req.body.Password;
    Startup.findOne({'Email': email},(err,data)=>{
          if(data)
             {
                 Challenge.find({'Student':{$nin : [data.Name]}},(err,challenge)=>{
           const result = passwordHash.verify(password,data.Password);
             if(result)
             {    
                if(data.Auth == 'No'){
                    res.render('studentdashboard/startupdashboard',{
                        message : 'You Have Not Authenticated Yet!'
                    });
                 }else{
                 req.session.username = email;
                 res.render('startupdashboard/dashboard',{
                     Student : data,
                     Challenge : challenge
                 });
                }
                
                 
             }
             else{
                 res.render('startupdashboard/startupdashboard',{
                     message : 'Invalid Credentials'
                 });
             
             }
         }).limit(3);
         }
             else{
                 res.render('startupdashboard/startupdashboard',{
                     message : 'Invalid Credentials'
                 });
        }
     
    });
 
 });


      router.get('/Shome',(req,res)=>{
        Startup.findOne({'Email' : req.session.username},(err,data)=>{
            Challenge.find({'Student':{$nin:[data.Name] }},(err,challenge)=>{
              if(data)
              {
                res.render('startupdashboard/dashboard',{
                    Student : data,
                    Challenge : challenge
                });
              }
            }).limit(3);
        });
        });

       
        router.get('/Screatechallenge',async(req,res,next)=>{
            if(!req.session.username){
                res.redirect('/Sdashboard');
            }else{
            try{
                const data= await Startup.findOne({'Email':req.session.username});
                res.render('startupdashboard/create-challenge',{
                    Student : data
                });
               }
               catch(e)
               {
                   next(e);
               }
            } 
        });

       
        router.get('/Smychallenges',async(req,res,next)=>{
            if(!req.session.username){
                            res.redirect('/Sdashboard');
                        }else{
           try{
             const data = await Startup.findOne({'Email' : req.session.username});
           
             if(data){
                 try{
                 const challenge = await Challenge.find({'Student' : data.Name });
                 if(challenge){
                     res.render('startupdashboard/mychallenges',{
                         Student : data,
                         Challenge : challenge
                     });
                 }}catch(e){
                     next(e);
                 }
               }}catch(e){
                   next(e);
               }
            }
        });
    
    
        router.get('/Sallchallenges',(req,res)=>{
            if(!req.session.username){
                res.redirect('/Sdashboard');
            }else{
                Startup.findOne({'Email' : req.session.username},(err,data)=>{
                Challenge.find((err,challenge)=>{
                    
                if(data)
                {
                  res.render('startupdashboard/challenges',{
                      Student : data,
                      Challenge : challenge
                  });
                }
          });
        });
    }});

    router.get('/Sdetails/:code',(req,res)=>{
        if(!req.session.username){
            res.redirect('/Sdashboard');
        }else{
            Startup.findOne({'Email' : req.session.username},(err,data)=>{
            Challenge.findOne({ '_id' : req.params.code },(err,challenge)=>{
            if(data)
            { 
                var example = challenge.Example;
                var extension = path.extname(example);
              res.render('startupdashboard/challenge-details',{
                  Student : data,
                  Challenge : challenge,
                  Extension : extension
              });
            }
      });
    });
}});


        router.post('/Screatechallenge',multer(multerConf).single('Example'),(req,res)=>{
            Startup.findOne({'Email' : req.session.username},(err,username)=>{
                 req.body.Example ='./uploads/'+req.file.filename;
                 req.body.Student = username.Name;
                 req.body.Status ="Not Submitted";
                Challenge.create(req.body,(err,data)=>{
                     if(data)
                      {
                          console.log(data);
                        res.render('startupdashboard/create-challenge',{
                             message : 'Created Successfuly',
                             Student: username
                         });
                         
                      }
                      else{
                        res.render('startupdashboard/create-challenge',{
                            message : 'Not Created',
                            Student : username
                         });
                      }
                  })
             });
            });
        
           router.get('/Ssubmit',(req,res)=>{
            if(!req.session.username){
                res.redirect('/Sdashboard');
            }else{
                Startup.findOne({'Email' : req.session.username},(err,data)=>{
                Challenge.find({'Student':{ $nin : [data.Name]}},(err,challenge)=>{
                if(data)
                {
                  res.render('startupdashboard/submit-challenge',{
                      Student : data ,
                      Challenges : challenge
                  });
                }
          });
        });  
    }});

    router.get('/Saccept',(req,res)=>{
        if(!req.session.username){
            res.redirect('/Sdashboard');
        }else{
        Startup.findOne({'Email' : req.session.username},(err,data)=>{
            Challenge.find({'Student':{ $nin : [data.Name]}},(err,challenge)=>{
            if(data)
            {
              res.render('startupdashboard/participate-challenge',{
                  Student : data ,
                  Challenges : challenge
              });
            }
      });
    });  
}});

router.post('/Sparticipate',async(req,res)=>{
  const data = await Startup.findOne({'Email':req.session.username});
  if(data){
     const challenge = await Challenge.find({'Student':{ $nin : [data.Name]}});
  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d');
  req.body.startDate = formatted;
  req.body.username = data.Name;
  const result = await Participate.create(req.body);
  if(result){
      const result = await Challenge.update({'Name':req.body.Name},{'Participated':'Yes'});
      res.render('startupdashboard/participate-challenge',{
          Student : data,
          Challenges : challenge,
          message : 'Submitted Successfully'
      })
  }
  }
});



    router.get('/Ssubmitchallenge',(req,res)=>{
        if(!req.session.username){
            res.redirect('/dashboard');
        }else{
            Startup.findOne({'Email' : req.session.username},(err,username)=>{
          res.render('studentdashboard/submit-challenge',{
              Student : username
          });
        
    });
}
    });

    router.post('/Ssubmitchallenge',multer(multerConf).single('Solution'),(req,res)=>{
        Startup.findOne({'Email' : req.session.username},(err,username)=>{
            Challenge.find((err,challenge)=>{
             req.body.Solution ='./uploads/'+req.file.filename;
             req.body.Username = username.Name;
             req.body.isAuth = 'No';
             req.body.isPOI = 'No';
             req.body.POI = 0;
            Submission.create(req.body,(err,data)=>{
                 if(data)
                  {
                      
                      Challenge.findOne({'Name' : req.body.Name },(err,Name)=>{
                          req.body.Status = "Submitted";
                         Challenge.update({'Name':req.body.Name},req.body,(err,result)=>{
                             if(err) throw err;
                             else{
                          
                                Startup.findOne({'Name' : Name.Student },(err,user)=>{
                          Submission.findOne({'Name' : req.body.Name,'Username':username.Name},(err,sub)=>{
                        let HelperOptions ={
                            from : config.EmailCredentials.Name+ '<'+config.EmailCredentials.Id ,
                            to : user.Email,
                            subject : "Edumonk Challenge",
                            text : sub.Username+" has completed your challenge"
                        }

                        transporter.sendMail(HelperOptions,(err,info)=>{
                            if(err) throw err;
                            console.log("The message was sent");
                        });
                      
                     
                    res.render('startupdashboard/submit-challenge',{
                         message : 'Submitted Successfuly',
                         Student: username,
                         Challenges : challenge
                     });
                    });
                    });
                }  
                });
            });
                  }
                  else{
                    res.render('startupdashboard/submit-challenge',{
                        message : 'Submission Failed',
                        Student : username,
                        Challenges : challenge
                     });
                  }
              })
         });
        });
    });

    router.get('/Smysubmission',(req,res)=>{
        if(!req.session.username){
            res.redirect('/Sdashboard');
        }else{
            Startup.findOne({'Email' : req.session.username},(err,data)=>{
            Submission.find({'Username' : data.Name},(err,submission)=>{
            if(data)
            {
                
                console.log(submission);
              res.render('startupdashboard/my-submission',{
                  Student : data ,
                  Mysubmission : submission
              });
            }
      });
    });  
}});

router.get('/Scredits',(req,res)=>{
    if(!req.session.username){
        res.redirect('/Sdashboard');
    }else{
        Startup.findOne({'Email' : req.session.username},(err,data)=>{
        if(data)
        {
          res.render('startupdashboard/rewardcredits',{
              Student : data
          });
        }
  });
}});

router.get('/Saccount',(req,res)=>{
    if(!req.session.username){
        res.redirect('/Sdashboard');
    }else{
        Startup.findOne({'Email' : req.session.username},(err,data)=>{
        if(data)
        {
          res.render('startupdashboard/myaccount',{
              Student : data
          });
        }
  });
}});

router.get('/Sdashlogout',(req,res)=>{
    req.session.destroy();
    res.redirect('/Sdashboard');
});

router.post('/Saboutme',multer(multerConf).single('ProfileImage'),(req,res)=>{
    Startup.findOne({'Email' : req.session.username},(err,data)=>{
         if(data){
            if(req.file == undefined){
                req.body.ProfileImage = data.ProfileImage;
                Startup.update({'Email' : req.session.username},req.body,(err,data)=>{
                    res.redirect('/Saccount');
                });
            }
            else{
                req.body.ProfileImage='./uploads/'+req.file.filename;
                Startup.update({'Email' : req.session.username},req.body,(err,data)=>{
                    res.redirect('/Saccount');
            });
            }
             
         }
    });
});

// router.post('/aboutme',(req,res)=>{
//     Register.findOne({'Email' : req.session.username},(err,data)=>{
//          if(data){
//              if(req.body.ProfileImage == ''){
//                  req.body.ProfileImage = data.ProfileImage;
//              }
//              Register.update({'Email' : req.session.username},req.body,(err,data)=>{
//                      res.redirect('/account');
//              });
//          }
//     });
// });

router.post('/Smyskills',(req,res)=>{
    Startup.findOne({'Email' : req.session.username},(err,data)=>{
         if(data){
             Register.update({'Email' : req.session.username},req.body,(err,data)=>{
                     res.redirect('/Saccount');
             });
         }
    });
});

router.post('/Smyqualification',(req,res)=>{
    Startup.findOne({'Email' : req.session.username},(err,data)=>{
         if(data){
             Register.update({'Email' : req.session.username},req.body,(err,data)=>{
                     res.redirect('/Saccount');
             });
         }
    });
});

router.post('/Suploadcv',multer(multerConf).single('CV'),(req,res)=>{
    Startup.findOne({'Email' : req.session.username},(err,data)=>{
         if(data){
             req.body.CV = './uploads/'+req.file.filename;
             Register.update({'Email' : req.session.username},req.body,(err,data)=>{
                     res.redirect('/Saccount');
             });
         }
    });
});

router.post('/Supdatepass',(req,res)=>{
    Startup.findOne({'Email':req.body.Email},(err,user)=>{
        const result = passwordHash.verify(req.body.Old,user.Password);
        if(result){
            if(req.body.New === req.body.CNew)
            {
                req.body.Password = passwordHash.generate(req.body.Password);
                req.body.CPassword = req.body.Password;
                console.log(req.body.New);
                console.log(req.body.CNew);
                Register.update({'Email':req.body.Email},req.body,(err,result)=>{
                    if (err) throw err;
                    res.render('startupdashboard/startupdashboard',{
                        message : 'Password Changed'
                    });
                });
            }
            else {
                res.render('startupdashboard/startupdashboard',{
                    message : 'Password Does not Changed'
                });
            }
        }
        else {
            res.render('startupdashboard/startupdashboard',{
                message : 'Password Does not Changed'
            });
        }

    });
});

router.get('/Ssubmittedchallenge',(req,res)=>{
    if(!req.session.username){
        res.redirect('/Sdashboard');
    }else{
        Startup.findOne({'Email' : req.session.username},(err,data)=>{
        if(data)
        {
        Challenge.find({'Status': 'Submitted','Student': data.Name},(err,challege)=>{
            if (err) throw err;
            else{
                    res.render('startupdashboard/submitted',{
              Challenge : challege,
              Student : data
          }); 
        }
        });
    
        }
  });
}});

router.get('/Sparticipatedchallenge',(req,res)=>{
    if(!req.session.username){
        res.redirect('/Sdashboard');
    }else{
    Startup.findOne({'Email' : req.session.username},(err,data)=>{
        if(data)
        {
        Challenge.find({'Student':data.Name,'Participated':'Yes'},(err,challege)=>{
            if (err) throw err;
            else{
                    res.render('startupdashboard/participated',{
              Challenge : challege,
              Student : data
          }); 
        }
        });
    
        }
  });
}});

router.get('/Sparticipants/:code',(req,res)=>{
    if(!req.session.username){
        res.redirect('/Sdashboard');
    }else{
    Startup.findOne({'Email' : req.session.username},(err,data)=>{
        if(data)
        {
        Participate.find({ 'Name' : req.params.code },(err,submission)=>{
            res.render('startupdashboard/participants',{
                Student : data,
                Solutions : submission,
            });
  });
}
});
}});


router.get('/Ssolution/:code',(req,res)=>{
    if(!req.session.username){
        res.redirect('/Sdashboard');
    }else{
        Startup.findOne({'Email' : req.session.username},(err,data)=>{
        if(data)
        {
        Submission.find({ 'Name' : req.params.code },(err,submission)=>{
            if(err) throw err;
            let i;
            // for(i=0;i<=submission.length;i++){
                submission.forEach(function(sub){
                    Register.findOne({'Name':sub.Username},(err,POI)=>{
                if (err) throw err;
            else{
                console.log(POI);
            res.render('startupdashboard/solutions',{
              Student : data,
              Solutions : submission,
              POI : POI
          });
        }
        });
    });
    // }
  });
}
});
}});

router.get('/Sauthenticate/:code/:user',(req,res)=>{
    if(!req.session.username){
        res.redirect('/Sdashboard');
    }else{
        Startup.findOne({'Email' : req.session.username},(err,data)=>{
        if(data)
        {
        Challenge.findOne({ 'Name' : req.params.code },(err,challenge)=>{
            if(err) throw err;
            else{
                console.log(challenge);
                Submission.findOne({'UserEmail':req.params.user,'Name':challenge.Name},(err,submission)=>{
                           Register.findOne({'Name': submission.Username},(err,student)=>{
                        var Credit = student.Credit;
                        var ChallengeReward = challenge.Reward;
                        var Credit = Credit + ChallengeReward;
                        Register.update({'Name': submission.Username},{'Credit':Credit},(err,result)=>{
                            if(err) throw err;
                            else{
                                Submission.update({'UserEmail':req.params.user,'Name':challenge.Name},{'isAuth':'Yes'},(err,done)=>{
                                    if(err) throw err;
                                    else{
                                        res.redirect('back');
                                    }
                                });
                                
                            }
                        });
                           });
                });
                
                
            }
          });
        
 
}
});
}});

router.post('/Srating/:code/:user',async(req,res)=>{
    if(!req.session.username){
        res.redirect('/Sdashboard');
    }else{
        Startup.findOne({'Email' : req.session.username},(err,data)=>{
        if(data)
        {
        Challenge.findOne({ 'Name' : req.params.code },(err,challenge)=>{
            if(err) throw err;
            else{
                Submission.findOne({'UserEmail':req.params.user,'Name':challenge.Name},(err,submission)=>{
                    Register.findOne({'Name': submission.Username},(err,student)=>{
                        console.log(student);
                        var POI = parseInt(student.POI);
                        console.log(POI);
                        var ChallengePOI = parseInt(req.body.rating);
                        console.log(ChallengePOI);
                        var POI = POI + ChallengePOI;
                        console.log(POI);
                        Register.update({'Name': submission.Username},{'POI':POI},(err,result)=>{
                            if(err) throw err;
                            else{
                                Submission.update({'UserEmail':req.params.user,'Name':challenge.Name},{'isPOI':'Yes','POI':req.body.rating},(err,done)=>{
                                    if(err) throw err;
                                    else{
                                        console.log('done');
                                        res.redirect('back');
                                    }
                                });
                                
                            }
                        });
                           });
                });
                
                
            }
          });
        
 
}
});
}});


router.get('/Sidcardform',async(req,res,next)=>{
    try{
        const data = await Startup.findOne({'Email':req.session.username});
        if(data){
            res.render('startupdashboard/idcardform',{
                Student : data
            });
        }
    }catch(e){
       next(e);
    }
    
});

router.get('/Sidcard',async(req,res,next)=>{
    try{
        const data = await Startup.findOne({'Email':req.session.username});
        if(data){
            try{
            const objective = await Objective.find({'Student':data.Name});
            try{
            const project = await Project.find({'Student':data.Name});
            try{
            const education = await Education.find({'Student':data.Name});
            try{
            const skill = await Skill.find({'Student':data.Name});
            try{
            const interest = await Interest.find({'Student':data.Name});
            try{
            const challenge = await Submission.find({'Username':data.Name});
            res.render('startupdashboard/idcard',{
                Student : data,
                Objective : objective,
                Project : project,
                Education : education,
                Skill : skill,
                Interest : interest,
                Challenge : challenge
            });
        }catch(e){
            next(e);
        }
        }catch(e){
            next(e);
        }
        }catch(e){
            next(e);
        }
        }catch(e){
            next(e);
        }
        }catch(e){
            next(e);
        }
        }catch(e){
            next(e);
        }
        }
    }catch(e){
       next(e);
    }
    
});

router.post('/Saddproject',async(req,res,next)=>{
    try{
   const data = await Startup.findOne({'Email':req.session.username});
   try{
       req.body.Student = data.Name;
   const result = await Project.create(req.body);
   if(result){
       res.redirect('/Sidcardform');
   }
} catch(e){
    next(e);
}
    } catch(e){
        next(e);
    }
});

router.post('/Saddskills',async(req,res,next)=>{
    try{
    const data = await Startup.findOne({'Email':req.session.username});
    req.body.Student = data.Name;
    try{
    const result = await Skill.create(req.body);
    if(result){
        res.redirect('/Sidcardform');
    }}
    catch(e){
        next(e);
    }
}catch(e){
    next(e);
}
});

router.post('/Saddeducation',async(req,res,next)=>{
    try{
    const data = await Startup.findOne({'Email':req.session.username});
    req.body.Student = data.Name;
    try{
    const result = await Education.create(req.body);
    if(result){
        res.redirect('/Sidcardform');
    }}
    catch(e){
        next(e);
    }
}catch(e){
    next(e);
}
});

router.post('/Saddinterest',async(req,res,next)=>{
    try{
    const data = await Startup.findOne({'Email':req.session.username});
    req.body.Student = data.Name;
    try{
    const result = await Interest.create(req.body);
    if(result){
        res.redirect('/Sidcardform');
    }}
    catch(e){
        next(e);
    }
}catch(e){
    next(e);
}
});

router.post('/Saddobjective',async(req,res,next)=>{
    try{
    const data = await Startup.findOne({'Email':req.session.username});
    req.body.Student = data.Name;
    try{
    const result = await Objective.create(req.body);
    if(result){
        res.redirect('/Sidcardform');
    }}
    catch(e){
        next(e);
    }
}catch(e){
    next(e);
}
});

router.get('/Supdatecard',async(req,res,next)=>{
    try{
       const data = await Startup.findOne({'Email':req.session.username});
       try{
        const skills = await Skill.find({'Student':data.Name});
        try{
            const projects = await Project.find({'Student':data.Name});
            try{
                  const objectives = await Objective.find({'Student':data.Name});
                  try{
                      const interests = await Interest.find({'Student':data.Name});
                      try{
                          const educations = await Education.find({'Student':data.Name});
                          res.render('startupdashboard/updatecard',{
                              Skill : skills,
                              Project : projects,
                              Objective : objectives,
                              Interest : interests,
                              Education : educations,
                              Student : data
                          });
                      } catch(e){
                          next(e);
                      }
                  }catch(e)
                  {
                      next(e);
                  }
            }catch(e){
                next(e);
            }
        }catch(e){
            next(e);
        }
       }catch(e){
           next(e);
       }
    }catch(e){
        next(e);
    }        
  
});

router.post('/Seditobjective/:code',async(req,res,next)=>{
    try{
    const result = await Objective.update({'_id':req.params.code},req.body);
    if(result){
        res.redirect('/Supdatecard');
    }
    }
    catch(e){
        next(e);
    } 
});

router.get('/Sdeleteobjective/:code',async(req,res,next)=>{
    try{
    const result = await Objective.remove({'_id':req.params.code});
    if(result){
        res.redirect('/Supdatecard');
    }
    }
    catch(e){
        next(e);
    } 
});

router.post('/Seditinterest/:code',async(req,res,next)=>{
    try{
    const result = await Interest.update({'_id':req.params.code},req.body);
    if(result){
        res.redirect('/Supdatecard');
    }
    }
    catch(e){
        next(e);
    } 
});

router.get('/Sdeleteinterest/:code',async(req,res,next)=>{
    try{
    const result = await Interest.remove({'_id':req.params.code});
    if(result){
        res.redirect('/Supdatecard');
    }
    }
    catch(e){
        next(e);
    } 
});

router.post('/Seditskill/:code',async(req,res,next)=>{
    try{
    const result = await Skill.update({'_id':req.params.code},req.body);
    if(result){
        res.redirect('/Supdatecard');
    }
    }
    catch(e){
        next(e);
    } 
});

router.get('/Sdeleteskill/:code',async(req,res,next)=>{
    try{
    const result = await Skill.remove({'_id':req.params.code});
    if(result){
        res.redirect('/Supdatecard');
    }
    }
    catch(e){
        next(e);
    } 
});

router.post('/Seditproject/:code',async(req,res,next)=>{
    try{
    const result = await Project.update({'_id':req.params.code},req.body);
    if(result){
        res.redirect('/Supdatecard');
    }
    }
    catch(e){
        next(e);
    } 
});

router.get('/Sdeleteproject/:code',async(req,res,next)=>{
    try{
    const result = await Project.remove({'_id':req.params.code});
    if(result){
        res.redirect('/Supdatecard');
    }
    }
    catch(e){
        next(e);
    } 
});

router.post('/Sediteducation/:code',async(req,res,next)=>{
    try{
    const result = await Education.update({'_id':req.params.code},req.body);
    if(result){
        res.redirect('/Supdatecard');
    }
    }
    catch(e){
        next(e);
    } 
});

router.get('/Sdeleteeducation/:code',async(req,res,next)=>{
    try{
    const result = await Education.remove({'_id':req.params.code});
    if(result){
        res.redirect('/Supdatecard');
    }
    }
    catch(e){
        next(e);
    } 
});



router.post('/Sreset',async(req,res,next)=>{
    var Url = req.protocol + '://' + req.get('host') + req.originalUrl;
    var code = await randomstring.generate({
        length: 12,
        charset: 'alphabetic'
      });
    var fullUrl = Url+'/'+req.body.Email+'/'+code;
    try{
    const result = await Startup.update({'Email':req.body.Email},{'Code':code});
    if(result){
        req.session.code = code;
        let HelperOptions ={
            from : config.EmailCredentials.Name+ '<'+config.EmailCredentials.Id ,
            to : req.body.Email,
            subject : "Password Reset",
            text : "The link to reset Your password is "+fullUrl
        }

        transporter.sendMail(HelperOptions,(err,info)=>{
            if(err) throw err;
            console.log("The message was sent");
        });
        res.render('startupdashboard/startupdashboard',{
            message : 'Check Your Email'
        });
      
    }
    }catch(e){
        next(e);
    }
});

router.get('/Sreset/:email/:code',async(req,res,next)=>{
    if(!req.session.code){
        res.redirect('/Sdashboard');
    }else{
    if(req.session.code == req.params.code){
        const email = req.params.email;
        const code = req.params.code;
      const data = await Startup.findOne({'Email':email,'Code':code});
       if(data)
       {
           res.render('startupdashboard/resetpassword',{
               Email : email
           });
            req.session.destroy();
       }else{
        res.render('startupdashboard/startupdashboard',{
            message : 'Invalid Email'
        });
       }}else{
           res.redirect('/Sdashboard');
       }
    }
});
 
router.post('/Schangepass',async(req,res,next)=>{
         if(req.body.New == req.body.CNew){
            const Password = passwordHash.generate(req.body.New);
            const CPassword = Password;
          const result = await Startup.update({'Email':req.body.Email},{'Password':Password,'CPassword':CPassword});
          if(result) {
              res.render('/startupdashboard/startupdashboard',{
                  message : 'Password Changed'
              });
          }
         }
        
});

router.get('/students',async(req,res)=>{
    if(!req.session.username){
        res.redirect('/Sdashboard');
    }else{
    const data = await Startup.findOne({'Email':req.session.username});
    console.log(data);
   if(data){
    console.log(req.session.username);
     const students = await Register.find();
     if(students){
         console.log(students);
         res.render('startupdashboard/student',{
             Student : data,
             Students : students
         });
     }
   }  
}
});


module.exports = router;

