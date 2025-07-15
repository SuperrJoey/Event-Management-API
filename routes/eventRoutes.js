const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEventDetails,
  registerForEvent,
  cancelRegistration,
  listUpcomingEvents,
  getEventStats
} = require('../controllers/eventController');

router.post('/', createEvent);
router.get('/upcoming', listUpcomingEvents);
router.get('/:id', getEventDetails);
router.post('/:id/register', registerForEvent);
router.delete('/:id/cancel/:userId', cancelRegistration);
router.get('/:id/stats', getEventStats);

module.exports = router;
