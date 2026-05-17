const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', listingController.getAllListings);
router.get('/user/:userId', listingController.getUserListings);
router.get('/:id', listingController.getListingById);
router.post('/', authenticateToken, listingController.createListing);
router.put('/:id', authenticateToken, listingController.updateListing);
router.delete('/:id', authenticateToken, listingController.deleteListing);
router.patch('/:id/status', authenticateToken, listingController.toggleStatus);

module.exports = router;
