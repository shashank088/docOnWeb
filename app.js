const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/",function(req,res){
  res.render("index");
});

app.get("/about-us",function(req,res){
  res.render("about-us");
});

app.get("/contact-us",function(req,res){
  res.render("contact-us");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
