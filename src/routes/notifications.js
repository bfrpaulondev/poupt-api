const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications, markAsRead, markAllAsRead, createNotification
} = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.post('/', protect, createNotification);

module.exports = router;
