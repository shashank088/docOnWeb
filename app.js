require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
var upload = require('express-fileupload');
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require('mongoose-findorcreate');
const doctorSchema = require("./model/doctorSchema");
const patientSchema = require("./model/patientSchema");
const noteSchema = require("./model/noteSchema");
var type;
var id = "";
const fs = require('fs');

const path = require('path');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
io.on('connection', () =>{
  console.log('a user is connected')
})

var server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});
app.use(bodyParser.json());
app.use(upload());



// defining userSchema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  accountType: String,
  profiled: doctorSchema,
  profilep: patientSchema
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
// app.use('public/css',express.static("css"));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const db_link = 'mongodb+srv://Shubham:kQJN89TBsVK769a@cluster0.rfffe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(db_link,
  { useNewUrlParser: true, useUnifiedTopology: true }, err => {
    console.log('connected');
  });
// mongoose.set("useCreateIndex", true);

// plugins
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// creating models based on schemas
const User = new mongoose.model("user", userSchema);
const Note = new mongoose.model("note", noteSchema);

// Serializing and deserializing
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    // var emailaddress = dotr(profile.emails[0].value);
    User.findOrCreate({ username: profile.id}, function (err, user, wasCreated) {
      // if(wasCreated==true) success = 1;
      // else success = 0;
      // id = user._id;
      // console.log(user);
      return cb(err, user);
    });
  }
));


// Get and post requests

app.get("/", function(req, res) {
  res.render("index");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

  app.get('/auth/google/secrets',
    passport.authenticate('google', {
      successRedirect: "/findDoc",
      failureRedirect: '/login',
      failureFlash: "Invalid username or password"}),
    function(req, res) {
      // Successful authentication, redirect home.
  });

app.get("/about-us", function(req, res) {
  res.render("about-us");
});

app.get("/contact-us", function(req, res) {
  res.render("contact-us");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/signup", function(req, res) {
  res.render("signup");
});


app.get("/findDoc", function(req, res) {
  res.render("findDoc", {
    doctorArray: []
  });
});

app.get("/doctorDetails", function(req, res) {
  res.render("doctorDetails");
})



app.get("/patientDetails", function(req, res) {
  res.render("patientDetails");
})

var docid;
app.get("/bookAppointment", function(req, res) {
  User.findById(docid,function(err, user){
    res.render("bookAppointment", {doctor: user});
  })

})


app.get("/dashboardPat", function(req, res){
  if (req.isAuthenticated()){
    console.log("Patient is authenticated");
      User.findById(req.user.id,function(err,foundPatient){
        res.render("dashboardPat",{users: foundPatient});
      });
  }
  else{
    res.redirect("/login");
  }
});

app.get("/dashboardDoc", function(req, res){
  if (req.isAuthenticated()){
    console.log("doctor is authenticated");
      User.findById(req.user.id,function(err,foundDoctor){
        res.render("dashboardDoc",{users: foundDoctor});
      });
  }
  else{
    res.redirect("/login");
  }
});



app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/success",function(req,res){
  if (req.isAuthenticated()){
    res.render("success");
  }else{
    res.redirect("/login");
  }
});

var notet;
app.get("/viewNotes",function(req,res){
  if (req.isAuthenticated()){
    res.render("viewNotes",{note:notet});
  }else{
    res.redirect("/login");
  }
});

app.post('/viewDocsDownload', function(req,res){
 const pat_id = req.body.pat_id;
  const doc_id = req.body.doc_id; 
  const document_id = req.body.documentId
  console.log(document_id,doc_id,pat_id);
  // console.log(req.body);
     User.findById({_id:doc_id},function(err,data){  
        var dcmnt = data.profiled.appointments.find(o=>o.patient_id==pat_id).docs
        .find(d=>d._id==document_id) ;
         // var buff = Buffer.from(dcmnt.documents).toString('base64')
            fs.writeFileSync('some.pdf',dcmnt.documents.data);
            res.download('some.pdf');   
     })  
}) 

// keep this buddy at last
app.get("/:profession", function(req, res) {
  var prof = req.params.profession;
  User.find({
    "profiled.profession": prof
  }, function(err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("findDoc", {
          doctorArray: foundUsers
        });
      }
    }
  });
});




app.post("/signup", function(req, res) {

  const user = new User({
    username: req.body.username,
  });
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/signupDoctor");
    } else {
      user.accountType = req.body.accountType;
      user.save();
      id = user._id;
      passport.authenticate("local")(req, res, function() {
        if (req.body.accountType == "1") res.redirect("/doctorDetails");
        else {
const newPatient = ({vitals:{}});
	user.profilep = newPatient;
	user.save();
          res.redirect("/patientDetails");
        }
      });
    };
  });
});


app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      id = user._id;
      console.log(id);
      passport.authenticate("local")(req, res, function() {
        if(req.body.accountType === "1") res.redirect("/dashboardDoc");
        else res.redirect("/dashboardPat");
      });
    }
  });
});

app.post("/doctorDetails", function(req, res) {
  const profession = req.body.profession;
  const name = req.body.name;

  console.log(profession, name);

  User.findById(req.user.id, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        console.log(foundUser._id, id);
        const newProfiled = ({
          name: name,
          profession: profession,
          phone : req.body.phoneNo
        });
        foundUser.profiled = newProfiled;
        foundUser.save(function() {
          res.redirect("/findDoc");
        });
      }
    }
  });
});


app.post("/patientDetails", function(req, res) {
  const name = req.body.name;

  console.log(name);

  User.findById(req.user.id, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        console.log(foundUser._id, id);
        const newProfilep = ({
		vitals:{},
          	name: name,
                phone : req.body.phoneNo
        });
        foundUser.profilep = newProfilep;
        foundUser.save(function() {
          res.redirect("/findDoc");
        });
      }
    }
  });
});

app.post("/search", function(req, res) {
  const profession = req.body.profession;
  res.redirect("/" + profession);
});


app.post("/bookAppointment-sender", function(req, res) {
  if (req.isAuthenticated()) {
    console.log(req.body.docid);
    docid = req.body.docid;
    res.redirect("bookAppointment");
  } else {
    res.redirect("/login");
  }
});

app.post("/bookAppointment", function(req, res) {
  if (req.isAuthenticated()) {
    User.findById(req.user.id, function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          console.log(foundUser._id, id);
          console.log(req.body.docid); console.log("called book appointment");
          User.findById(req.body.docid,function(err,foundDoctor){

             
              const doctorAppointment = ({
                patient_id: foundUser._id,
                patient_name: foundUser.profilep.name,
                visit_type: req.body.selectone,
                symptoms: req.body.symptoms
              });

              foundDoctor.profiled.appointments.push(doctorAppointment);
              foundDoctor.save();

           
              const patientAppointment = ({
              doctor_id: req.body.docid,
              visit_type: req.selectone,
              doctor_name: foundDoctor.profiled.name,
              doctor_profession: foundDoctor.profiled.profession
            });
              foundUser.profilep.appointments.push(patientAppointment);
              foundUser.save();
              res.redirect("/dashboardPat");
          })

        }
      }
    });
  } else {
    res.redirect("/login");
  }
});


var dataa = {
    xx: ['2021-09-04', '2021-10-04', '2021-11-04', '2021-12-04'],
    yy: [1, 3, 6, 8],
    type: 'scatter'
  };

app.post("/postDocReadmore", function(req,res){
  if (req.isAuthenticated()) {
  User.findById(req.body.viewmore,function(err,pat){
    User.findById(req.user._id,function(err, doc){

      var appt;
      doc.profiled.appointments.forEach(function(appointment){
         if(appointment.patient_id === req.body.viewmore) appt=appointment;
       });

      res.render("readMoreDoctor",{doc: doc, pat: pat, appointment: appt, data: dataa});
    })
  })
}else{
  res.redirect("/login");
}
});


app.post("/postPatReadmore",function(req,res){
  // doctor id is in req.body.viewmore
  // patient is current user who is logged in
    if (req.isAuthenticated()) {
  User.findById(req.body.viewmore,function(err, doc){
    User.findById(req.user._id ,function(err, pat){
      var appt;
      doc.profiled.appointments.forEach(function(appointment){
         if(appointment.patient_id == pat._id) {appt=appointment; console.log("if worked");}
       });

      res.render("readMorePatient",{pat:pat,doc: doc, appointment: appt});
    })
  })
}else{
  res.redirect("/login");
}
});


// for sbmitting notes, new code starts

app.post("/readMoreDoctor/submitNotes",function(req,res){
  // patient id is in req.body.patid
    if (req.isAuthenticated()) {
      Note.findOne({patient_id: req.body.patid , doctor_id: req.user._id}, function (err, note) {
        if(err) console.log(err)
        else{
          if(note){
            note.notes.push(req.body.notesContent);
            note.save();
            res.redirect("/success");
          }else{
            const newnote = new Note ({
              patient_id: req.body.patid,
              doctor_id: req.user._id,
            });
            newnote.notes.push(req.body.notesContent);
            newnote.save();
            res.redirect("/success");
          }
        }
      });

    }else{
      res.redirect("/login");
    }
});

app.post("/readMoreDoctor/viewNotes",function(req,res){
  // patient id is in req.body.patid
  if (req.isAuthenticated()) {
    Note.findOne({patient_id: req.body.patid , doctor_id: req.user._id}, function (err, note) {
      if(err) console.log(err)
      else{
        if(note){
          notet=note;
          res.redirect("/viewNotes");
        }
        else{
          res.send("no notes found");
        }
      }
    });
  }else{
    res.redirect("/login");
  }
});

app.post("/vitals-bp",function(req,res){
  // patient id is in req.body.patid
  // this post request is coming from readMoreDoctor
  if (req.isAuthenticated()) {
    User.findById(req.body.patid, function(err,pat){
      if(err) console.log(err);
      else{
        if(pat){
          console.log(pat._id,pat.username);
          const newreading = ({
            reading: req.body.bpreading.toString(),
            date: req.body.bpdate.toString()
          });
          console.log(newreading);
          pat.profilep.vitals.bp.push(newreading);
          pat.save();
          res.redirect("/success");
        }
      }
    })
  }else{
      res.redirect("/login");
  }

});


app.post("/vitals-sugar",function(req,res){
  // patient id is in req.body.patid
  // this post request is coming from readMoreDoctor
  if (req.isAuthenticated()) {
    User.findById(req.body.patid, function(err,pat){
      if(err) console.log(err);
      else{
        if(pat){
          console.log(pat._id,pat.username);
          const newreading = ({
            reading: req.body.sugarreading.toString(),
            date: req.body.sugardate.toString()
          });
          console.log(newreading);
          pat.profilep.vitals.sugar.push(newreading);
          pat.save();
          res.redirect("/success");
        }
      }
    })
  }else{
      res.redirect("/login");
  }

});


app.post("/vitals-weight",function(req,res){
  // patient id is in req.body.patid
  // this post request is coming from readMoreDoctor
  if (req.isAuthenticated()) {
    User.findById(req.body.patid, function(err,pat){
      if(err) console.log(err);
      else{
        if(pat){
          console.log(pat._id,pat.username);
          const newreading = ({
            reading: req.body.weightreading.toString(),
            date: req.body.weightdate.toString()
          });
          console.log(newreading);
          pat.profilep.vitals.weight.push(newreading);
          pat.save();
          res.redirect("/success");
        }
      }
    })
  }else{
      res.redirect("/login");
  }

});





/***********************pdf upload routes*************************************/


app.post('/viewDocsPatient', (req, res) => {
  const doc_id = req.body.doc_id;
  const pat_id = req.user._id;
  User.findById({_id:doc_id}, (err, data) => {
    if (err) { 
      console.log(err);
      res.status(500).send('An error occurred', err);
    }
    else {
      var docs = data.profiled.appointments.find(o=>o.patient_id == pat_id).docs
      res.render('viewDocs',{data:docs,pat_id:pat_id,doc_id:doc_id});
    }
  });
});

app.post('/viewDocsDoctor', (req, res) => {
  const pat_id = req.body.pat_id;
  const doc_id = req.user._id;
  User.findById({_id:doc_id}, (err, data) => {
    if (err) { 
      console.log(err);
      res.status(500).send('An error occurred', err);
    }
    else {
      var docs = data.profiled.appointments.find(o=>o.patient_id == pat_id).docs
      res.render('viewDocs',{data:docs,pat_id:pat_id,doc_id:doc_id});
    }
  });
});




app.post('/viewDocsSave', (req, res)=>{
  console.log(req.body);
  const pat_id = req.body.pat_id;
  const doc_id = req.body.doc_id;
  console.log(req.files);
  const doc = ({
    documents: {
      data :req.files.doc.data,
      contentType: 'image/png'
    }
    });
  User.findById({_id:doc_id},function(err,data){
    data.profiled.appointments.find(o=> o.patient_id==pat_id).docs.push(doc);
    data.save();
    if(pat_id == req.user._id)
	    res.redirect('/dashboardPat');
    else
	res.redirect('/dashboardDOc');
  });
});




/*********************text chat routes ****************************/
app.post("/chatDoctor",function(req,res){
    const pat_id = req.body.pat_id;
    const doc_id = req.user._id;
    res.render("chatDoctor",{doc_id:doc_id,pat_id:pat_id});
})

app.post("/chatPatient",function(req,res){
  
  const pat_id = req.user._id;
  const doc_id = req.body.doc_id;
  res.render("chatPatient",{doc_id:doc_id,pat_id:pat_id});
})


app.post('/chat/:id', (req, res) => {

  console.log(req.params.id);
  console.log(req.body.messageInp);
    io.emit('receive', {id:req.params.id,message:req.body.messageInp});
    res.sendStatus(200);
})



/******************video chat routes ***********************/

app.post('/videoChat/:id',(req,res)=>{
  const id = req.params.id;
  const button = req.body.button;
  console.log(req.body);
  console.log('Doctor patient video chat id : '+id);
  if(button==="call"){
    io.emit('call',{id:id})
  }
  else if(button==="answer"){
    console.log('sending response')
    io.emit('callProgress',req.body);
  }else if(button=="sendPeerId"){
    io.emit('connected',req.body);
  }
  res.sendStatus(200);
})


