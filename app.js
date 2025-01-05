const path = require("path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
require("./strategies/localStrategy.js");
const flash = require("connect-flash");
const pool = require("./db/pool.js");
const { hashPassword } = require("./helper/bycrpjsHash.js");
const pgSession = require("connect-pg-simple")(session);


const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
    store: new pgSession({
      pool: pool,
    }),
  })
);

app.use(flash());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.render("index", {
    success: req.flash("success"),
  });
});

app.get("/register", (req, res) => {
  res.render("sign-up-form");
});

app.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  const hashedPassword = await hashPassword(password);
  console.log(hashedPassword);
  console.log(password);

  // Example validation logic
  if (!username || !password) {
    req.flash("error", "All fields are required");
    return res.redirect("/register");
  }

  try {
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username,
      hashedPassword,
    ]);
    req.flash("success", "Registration successful. Please login.");
    res.redirect("/login");
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

app.get("/login", (req, res) => {
  res.render("login-form");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out");
    res.redirect("/");
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).send("Page not found");
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.status(500).send(err.message);
});

app.listen(3000, async () => {
  console.log("Server is running on port 3000");
  await pool.connect();
  console.log("Connected to the database");
});
