const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const { q, category } = req.query;
  let filter = {};
  if (q) {
    const searchRegex = new RegExp(q, 'i');
    filter.$or = [
      { title: searchRegex },
      { location: searchRegex }
    ];
  }
  if (category && category !== 'All') {
    filter.category = category;
  }
  const allListings = await Listing.find(filter);
  res.render("listings/index", { allListings, selectedCategory: category || "All", q: q || "" });
};

module.exports.new = (req, res) => {
  res.render("listings/new");
};

module.exports.show=async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate({path: "reviews", populate:{path:"author"},}).populate("owner");
  if (!listing) {
    req.flash("error","Listing does not exist!");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show", { listing });
};

module.exports.create=async (req, res) => {
    const geoData = await geocodingClient
    .forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
    })
    .send();
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    newListing.geometry= geoData.body.features[0].geometry;
    await newListing.save();
    req.flash("success","New listing added successfully!!");
    res.redirect("/listings");
};

module.exports.edit=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
    req.flash("error","Listing does not exist!");
    res.redirect("/listings");
    }
    let originalURL= listing.image.url;
    originalURL = originalURL.replace("/upload","/upload/w_250");
    res.render("listings/edit", { listing, originalURL });
};

module.exports.update=async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing);
    if(typeof req.file !=="undefined"){
      let url=req.file.path;
      let filename=req.file.filename;
      listing.image={url,filename};
      await listing.save();
    }
    req.flash("success","Listing Updated!!");
    res.redirect(`/listings/${id}`);
};

module.exports.delete=async (req, res) => {
  const { id } = req.params;
  const delList = await Listing.findByIdAndDelete(id);
  if (!delList) {
    throw new expressError(404, "Listing to delete not found");
  }
  req.flash("success","Listing deleted successfully!!");
  res.redirect("/listings");
};
