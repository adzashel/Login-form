// configure modules
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { validationResult, checkSchema } = require("express-validator");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");


// connect to mongodb server
mongoose
  .connect("mongodb://localhost:27017/login", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Connection error:", err));

// create user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// create User model

const User = mongoose.model("user_logins", userSchema);


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

// middleware

app.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
    layout: "layouts/container",
    message: req.flash("success"),
    errors: req.flash("error"),
  });
});

// register route middleware
app.get("/register", (req, res) => {
  res.render("register", {
    errors : req.flash("error"),
    title: "Register",
    layout: "layouts/container",
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    layout: "layouts/container",
    errMessage : req.flash("error"),
  });
});

// send request to register
app.post("/register", checkSchema(validationEmailPass), async (req, res) => {
  const errors = validationResult(req);
  // if errors is exist
  if (!errors.isEmpty()) {
    return res.render("register", {
      title: "Register",
      layout: "layouts/container",
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;
  saltRound = 13;
  // check email , if email is already registered return an error message
  try {
    // hashed password
    const hashedPass = await bcrypt.hash(password, saltRound);
    if (!hashedPass) {
      throw new Error("hashed Failed");
    }

    // email exist or not
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      req.flash("error", "Email already registered");
      res.redirect("/register");
      return;
    }

    // add new user
    const newUser = new User({ email, password: hashedPass });
    await newUser.save();
    req.flash("success", "Registration success");
    res.redirect("/");
  } catch {
    req.flash("error", "Error registering");
    res.redirect("/register");
    return;
  }
});

app.post('/login' , 
  checkSchema(validationUser),
  async ( req , res ) => {
    const errors = validationResult(req);
    if( !errors.isEmpty() ) {
      return res.render('login', {
        title : 'Login',
        layout : 'layouts/container',
        errMessage : errors.array(),
      });
    };

    const { email , password } = req.body;

    try {
      const validUser = await User.findOne({ email });
      if( validUser === false ) {
        req.flash('error', 'Email not found');
        res.redirect('/login');
        return;
      }

      const isMatch = await bcrypt.compare( password , validUser.password );
      if( !isMatch ) {
        req.flash('error', 'Incorrect password');
        res.redirect('/login');
        return;
      }

      req.flash('success', 'Login successful');
      res.redirect('/');
    } catch(err) {
      req.flash('error', 'Error logging in');
      res.redirect('/login');
      return;
    }
  }
)

app.listen(port, (err, res) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`Server running on port http://localhost:${port}`);
  }
});
