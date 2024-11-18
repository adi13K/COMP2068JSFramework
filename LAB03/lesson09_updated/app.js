var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("passport");
var session = require("express-session");
var mongoose = require("mongoose");
var dotenv = require("dotenv");
var hbs = require("hbs");

// Load environment variables
dotenv.config();

// Router Objects
var indexRouter = require("./routes/index");
var projectsRouter = require("./routes/projects");
var coursesRouter = require("./routes/courses");

// Import User model
var User = require("./models/user");

// Import Google Strategy
var GoogleStrategy = require("passport-google-oauth20").Strategy;

// Express App Object
var app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Session and Passport configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "s2021FitnessTracker",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport for Local Strategy
passport.use(User.createStrategy());

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/google/callback", // Update this for production
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ oauthId: profile.id });
        if (user) {
          return done(null, user);
        } else {
          const newUser = new User({
            username: profile.displayName,
            oauthId: profile.id,
            oauthProvider: "Google",
            created: Date.now(),
          });
          const savedUser = await newUser.save();
          return done(null, savedUser);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize/Deserialize User
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.use("/", indexRouter);
app.use("/projects", projectsRouter);
app.use("/courses", coursesRouter);

// MongoDB Connection
mongoose
  .connect(process.env.CONNECTION_STRING_MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected Successfully to MongoDB!"))
  .catch((error) => console.error(`Error while connecting to MongoDB: ${error}`));

// Handlebars Helpers
hbs.registerHelper("createOptionElement", (currentValue, selectedValue) => {
  const selectedProperty =
    currentValue == selectedValue.toString() ? "selected" : "";
  return new hbs.SafeString(
    `<option ${selectedProperty}>${currentValue}</option>`
  );
});

hbs.registerHelper("toShortDate", (longDateValue) => {
  return new hbs.SafeString(longDateValue.toLocaleDateString("en-CA"));
});

// Error Handling
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
