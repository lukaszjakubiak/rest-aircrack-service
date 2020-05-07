const WPAData = require('../api/models/wpaData');
const dataProcessor = require('./DataProcessor');

exports.periodicalCheck = () => {
    const job = setInterval(() => {
        WPAData.find()
            .exec()
            .then(results => {
                for (let wpaData of results) {
                    dataProcessor.reviewData(wpaData);
                }
            })
            .catch();

    }, 10000);
}