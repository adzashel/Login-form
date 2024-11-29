// configure modules
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const {
  body,
  validationResult,
  check,
  checkSchema,
} = require("express-validator");
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
  "/login",
  checkSchema({
    password: {
      isLength: {
        options: { min: 8 },
        errorMessage : "Password must be at least 8 characters"
      },
      matches: { 
        options : /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[_!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/, 
        errorMessage : "Password must be at least one uppercase letter , one lowercase letter , and unique symbols"
       },
    },
    email: {
      isEmail: {
        errorMessage: "Please enter a valid email address",
      },
      custom: {
        options: (value) => {
          // Custom validation logic to check for duplicate emails
          // Replace this with your actual duplicate email check logic
          const isDuplicate = duplicateEmail(value);
          if (isDuplicate) {
            throw new Error("Email already exists");
          }
          return true;
        },
      },
    },
  }),
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

// register route middleware
app.get('/register' , (req, res) => {
  res.send('this is a registration page');
});

app.listen(port, (err, res) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`Server running on port http://localhost:${port}`);
  }
});
