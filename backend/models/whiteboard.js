const mongoose = require('mongoose');

const WhiteboardSchema = new mongoose.Schema({
    lines: {
        type: Array,
        default: [],
    },
});

module.exports = mongoose.model('Whiteboard', WhiteboardSchema);
