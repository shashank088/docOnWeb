require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const doctorSchema = require("./model/doctorSchema");
// const patientSchema = require("./model/patientSchema");
// const noteSchema = require("./model/noteSchema");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.set("useCreateIndex", true);


// plugins
doctorSchema.plugin(passportLocalMongoose,{usernameField: "email"});
doctorSchema.plugin(findOrCreate);
// patientSchema.plugin(passportLocalMongoose);
// patientSchema.plugin(findOrCreate);

// creating models based on schemas
const Doctor = new mongoose.model("Doctor", doctorSchema);
// const Patient = new mongoose.model("Patient", patientSchema);

passport.use(Doctor.createStrategy());
passport.serializeUser(function(doctor, done) {
  done(null, doctor.id);
});
passport.deserializeUser(function(id, done) {
  Doctor.findById(id, function(err, doctor) {
    done(err, doctor);
  });
});

// passport.use(Patient.createStrategy());
// passport.serializeUser(function(patient, done) {
//   done(null, doctor.id);
// });
// passport.deserializeUser(function(id, done) {
//   Patient.findById(id, function(err, patient) {
//     done(err, patient);
//   });
// });







app.get("/",function(req,res){
  res.render("index");
});

app.get("/about-us",function(req,res){
  res.render("about-us");
});

app.get("/contact-us",function(req,res){
  res.render("contact-us");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/signup",function(req,res){
  res.render("signup");
});

app.get("/findDoc",function(req,res){
  res.render("findDoc");
});



app.post("/signup",function(req,res){
    const emailaddress = req.body.email;
    const user = new Doctor({
      email:emailaddress
    });
    Doctor.register({email: req.body.email}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/signup");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/login");
            });
        };
    });
});

app.post("/login", function(req, res){

  console.log("coming to post req login");

  const user = new Doctor({
    email: req.body.email,
    password: req.body.password
  });
  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
      res.redirect("/findDoc");
      });
    }
  });

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
