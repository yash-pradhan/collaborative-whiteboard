const express = require('express');
const Whiteboard = require('../models/Whiteboard');
const router = express.Router();

router.get('/', async (req, res) => {
    const whiteboard = await Whiteboard.findOne();
    res.json(whiteboard);
});

module.exports = router;
