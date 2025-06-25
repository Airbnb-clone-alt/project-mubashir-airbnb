if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/WrapAsync.js");
const MongoStore = require('connect-mongo');
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const userRouter = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRoutes = require("./routes/user");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })





// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const session = require("express-session");

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});


const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
    maxAge: 7 * 24 * 60 * 60 * 1000,               // 1 week in milliseconds
    httpOnly: true,                                // can't access cookie via client-side JS
  },
};
app.get("/", (req, res) => {
  res.redirect("/listings")
})
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
  next(); // 👈 Add this line!
});

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student",
//   });
//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// });


// mongodb+srv://project-mubashir-airbnb:Mubashir@2011@cluster0.gaefyx4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
app.use("/listings", listingRouter);
const reviewRouter = require("./routes/review.js"); // correct path
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRoutes);

// Last route - Page Not Found
app.use((req, res, next) => {
  res.status(404).render("listing/error.ejs"); // 404.ejs file banani padegi views folder me
});


app.listen(8080, () => {
  console.log("server is listening to port 8080");
});