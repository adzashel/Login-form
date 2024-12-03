// configure modules
const express = require("express");
const data = require("./database/login.json");
const expressLayouts = require("express-ejs-layouts");
const { validationResult, checkSchema } = require("express-validator");
const app = express();
const {
  addUser,
  duplicateEmail,
  validateEmail,
  renderData,
} = require("./script");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");

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
    errMessage: req.flash("error"),
  });
});

// validation schemas
const validationUser = {
  email: {
    isEmail: true,
    errorMessage: "Please enter a valid email address",
  },
};

const validationEmailPass = {
  email: {
    isEmail: true,
    errorMessage: "Please enter a valid email address",
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
  password: {
    isLength: {
      options: { min: 8 },
      errorMessage: "Password must be at least 8 characters",
    },
    matches: {
      options:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[_!@#$%^&*](?=.*\d))[A-Za-z\d!@#$%^&*]{8,}$/,
      errorMessage: "Password needs uppercase , lowercase , and unique symbols",
    },
  },
};

// register route middleware
app.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
    layout: "layouts/container",
  });
});

// send request to register
app.post("/register", checkSchema(validationEmailPass), async (req, res) => {
  const errors = validationResult(req);
  // check if error is exist
  if (errors.isEmpty() === false) {
    res.render("register", {
      title: "Register",
      layout: "layouts/container",
      errors: errors.array(),
    });
  } else {
    const { email, password } = req.body;
    // check email
    const hashedPassword = await bcrypt.hash(password, 13);
    if (!hashedPassword) {
      throw new Error('error hashing');
    }
    // add user to data
    addUser({
      email,
      hashed: hashedPassword,
    });
    req.flash("success", "Registration success");
    res.redirect("/");
  }
});

app.post("/login", checkSchema(validationUser), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("login", {
      title: "Login",
      layout: "layouts/container",
      errors: errors.array(),
    });
  } else {
    const { email , password } = req.body;
    const isEmailValid = validateEmail(email);
    if(!isEmailValid) {
      req.flash("error", "Email does not exist");
      res.redirect("/login");
      return;
    }
    const data =  await renderData();
    const isValid = await bcrypt.compare(password , data.password);
    if(!isValid) {
      req.flash("error", "Incorrect password");
      res.redirect("/login");
      return;
    }
  }
});

app.listen(port, (err, res) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`Server running on port http://localhost:${port}`);
  }
});
