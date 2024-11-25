// configure modules
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { body , validationResult } = require("express-validator");
const app = express();
const { addUser , duplicateEmail} = require("./script");
const bodyParser = require("body-parser");

// use body-parser middleware

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// use ejs layout
app.use(expressLayouts);
app.set("view engine", "ejs");

// reach static files
app.use(express.static("public"));
// port
const port = 5175;

// middleware

app.get('/' , (req, res) => {
    res.send("HOME");
})
app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    layout: "layouts/container",
  });
});

app.post("/login", [
  body('email').isEmail().custom(( value ) => {
    const isEmailDuplicate = duplicateEmail(value);
    if(isEmailDuplicate) {
      throw new Error('Email already exists');
    }
    return true;
  })
] ,(req, res) => {
  addUser(req.body);
  console.log('new data received');
  res.redirect('/');
});

app.listen(port, (err, res) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`Server running on port localhost:${port}`);
  }
});
