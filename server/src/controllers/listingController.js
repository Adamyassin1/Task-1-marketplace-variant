import Joi from 'joi';
import { Listing } from '../models/Listing.js';

const listingSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  price: Joi.number().min(0).required(),
  category: Joi.string().valid('textbooks', 'electronics', 'furniture', 'clothing', 'other'),
  condition: Joi.string().valid('new', 'like-new', 'used', 'worn'),
  status: Joi.string().valid('active', 'sold', 'removed'),
  seller: Joi.string().allow('', null),
});

// GET /api/listings
// TODO: implement per README.md section 3.
export async function getAllListings(req, res, next) {
  try {
    const filter = req.query.includeRemoved === 'true' ? {} : { status: { $ne: 'removed' } };
    const listings = await Listing.find(filter).populate('seller', 'name email');
    res.json(listings);
  } catch (err) { next(err); }
}

// GET /api/listings/:id
// TODO: implement per README.md sections 3 and 5.
export async function getListing(req, res, next) {
  try {
    const filter = {
      _id: req.params.id,
      ...(req.query.includeRemoved === 'true' ? {} : { status: { $ne: 'removed' } })
    };
    const listing = await Listing.findOne(filter).populate('seller', 'name email');
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) { next(err); }
}

// POST /api/listings
// TODO: implement per README.md section 3.
export async function createListing(req, res, next) {
  try {
    const { error, value } = listingSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const listing = await Listing.create(value);
    res.status(201).json(listing);
  } catch (err) { next(err); }
}

// PATCH /api/listings/:id
// TODO: implement per README.md sections 3 and 5.
export async function updateListing(req, res, next) {
  try {
    const { error, value } = listingSchema.fork(['title', 'price'], (schema) => schema.optional()).validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const listing = await Listing.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) { next(err); }
}

// DELETE /api/listings/:id
// TODO: implement per README.md sections 4 and 5.
export async function deleteListing(req, res, next) {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: 'removed' },
      { new: true }
    );
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) { next(err); }
}
