
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
      let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);
  newReview.author = req.user._id;
  await newReview.save();
  await listing.save();
    req.flash("success", "New Review Created Successfully");
res.redirect(`/listings/${listing._id}`);
}


module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
        req.flash("success", "New Review Deleted Successfully");
    res.redirect(`/listings/${id}`);
}
