const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');
const ctr     = require('../controllers/userController');

// before: router.post('/users/:userId/favorites', …)
// after:
router.post('/:userId/favorites',        auth, ctr.addFavorite);
router.get('/:userId/favorites',         auth, ctr.getFavorites);
router.delete('/:userId/favorites/:itemId', auth, ctr.removeFavorite);

module.exports = router;
