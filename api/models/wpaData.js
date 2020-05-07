const mongoose = require('mongoose');

const WPADataSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    capfile: {
        type: String,
        required: true
    },
    apmac: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'accepted'
    },
    createdTime: {
        type: Date,
        required: true
    },
    dictionaries: {
        type: String
    },
    currentDictionary: {
        dict: Number
    },
    progress: {
        dictionary: {
            type: Number,
            default: 0
        },
        precentage: {
            type: Number,
            default: 0
        }
    },
    password: {
        type: String
    }
});

module.exports = mongoose.model('WPAData', WPADataSchema);