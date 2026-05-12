const express = require('express');
const router = express.Router();
const {
  getNotifications, markAsRead, markAllAsRead, createNotification
} = require('../controllers/notificationController');

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.post('/', createNotification);

module.exports = router;
