// configure modules
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { body, validationResult, check} = require("express-validator");
const app = express();
const { addUser, duplicateEmail } = require("./script");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

// use express-session middleware and cookie parser
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 600000, // 10 minutes
    },
  })
);

app.use(flash());

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

app.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
    layout: "layouts/container",
    message: req.flash("success"),
    errors: req.flash("error"),
  });
});
app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    layout: "layouts/container",
  });
});


app.post(
  "/login",[
    body('email').isEmail().withMessage('Invalid email')
    .custom(( value ) => {
      const isEmailDuplicate = duplicateEmail(value);
      // check if email already exists
      if(isEmailDuplicate) {
        throw new Error('Email already exists');
      } else {
        return true; // email is unique
      }
    }),
    check('password' , 'The password must be at least 8 chars and 1 uppercase character')
    .isLength( { min : 8 })
    .matches(/[A-Z]/)
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("login", {
        title: "Login",
        layout: "layouts/container",
        errors: errors.array(),
        user: req.body,
      });
    } else {
      addUser(req.body);
      req.flash("success", "Login success");
      res.redirect("/");
    }
  }
);

app.listen(port, (err, res) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`Server running on port http://localhost:${port}`);
  }
});
