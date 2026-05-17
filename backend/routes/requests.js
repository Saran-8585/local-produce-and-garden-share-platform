const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, requestController.createRequest);
router.get('/sent', authenticateToken, requestController.getSentRequests);
router.get('/received', authenticateToken, requestController.getReceivedRequests);
router.patch('/:id/accept', authenticateToken, requestController.acceptRequest);
router.patch('/:id/decline', authenticateToken, requestController.declineRequest);
router.patch('/:id/complete', authenticateToken, requestController.completeRequest);
router.patch('/:id/cancel', authenticateToken, requestController.cancelRequest);

module.exports = router;
