const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// Create, read, update, delete users (Admin only)
router.post('/create', UserController.createUser); // Admin creates users
router.get('/', UserController.getAllUsers); // Admin fetches all users
router.put('/update/:id', UserController.updateUser); // Admin updates users
router.delete('/delete/:id', UserController.deleteUser); // Admin deletes users

module.exports = router;
