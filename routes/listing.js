const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("../utils/WrapAsync.js");
const Review = require("../models/review.js");
const {isLoggedIn, isOwner} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })





//Index Route
router.get("/", wrapAsync(listingController.index));



// New 
router.get("/new",isLoggedIn,listingController.renderNewForm );

//show router
router.get(
  "/:id",
  wrapAsync(listingController.showListing)
);


router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  wrapAsync(listingController.createListing)
);



// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);

//Update Route
router.put("/:id",isLoggedIn,  upload.single("listing[image]"),isOwner,(listingController.update));

//Delete Route
router.delete("/:id", isLoggedIn,isOwner, (listingController.delete));


module.exports = router;