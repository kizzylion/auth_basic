const passport = require("passport");
const pool = require("../db/pool.js");
const { comparePassword } = require("../helper/bycrpjsHash.js");
const LocalStrategy = require("passport-local").Strategy;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id =$1", [id]);
    const user = rows[0];
    done(null, user);
  } catch (err) {
    console.log(err);
  }
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = rows[0];

      if (!user)
        return done(null, false, { message: "Username doesn't exist" });
      if (!(await comparePassword(password, user.password)))
        return done(null, false, { message: "Incorrect password" });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);
