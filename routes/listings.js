const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listingsController');

router.get('/listings', listingsController.getListings);

module.exports = router;
