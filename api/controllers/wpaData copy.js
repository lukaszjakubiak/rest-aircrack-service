const mongoose = require('mongoose');

const WPAData = require('../models/wpaData');

exports.get_all = (req, res, next) => {
    WPAData.find()
        .exec()
        .then(results => {
            console.log(results);
            const objects = results.map(wpaData => {
                return ({
                    _id: wpaData._id,
                    capfile: wpaData.capfile,
                    apmac: wpaData.apmac,
                    status: wpaData.status,
                    progress: wpaData.progress,
                    password: wpaData.password ? null : ''
                });
            });
            res.status(200).json({
                objects: objects
            });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                error: error
            });
        });
}

exports.get = (req, res, next) => {

}

exports.create = (req, res, next) => {
    console.log(req.body);
    const capfile = req.body.capfile;
    const apmac = req.body.apmac;
    const newWPAData = new WPAData({
        _id: mongoose.Types.ObjectId(),
        capfile: capfile,
        apmac: apmac
    });
    console.log(newWPAData);
    newWPAData.save()
        .then(wpaData => {
            console.log(wpaData);
            res.status(200).json({
                _id: wpaData._id,
                capfile: wpaData.capfile,
                apmac: wpaData.apmac,
                status: wpaData.status
            });
            console.log('create.processData _id: ' + wpaData._id);
            processData(wpaData._id);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                error: error
            });
        })
}

const processData = _id => {
    console.log('processData _id: ' + _id);
    setInterval((_id) => {
        console.log('setInterval _id: ' + _id);
        try {
            Promise.all(getWPAData(_id)
                .then(wpaData => {
                    console.log('From DB: ' + wpaData);
                    wpaData.progress = wpaData.progress + 10;
                    if (wpaData.progress === 100) {
                        wpaData.status = 'finished';
                    }
                    console.log('Updated DB: ' + wpaData);
                    updateWPAData(wpaData);
                    if (wpaData.status === 'finished') {
                        clearInterval(this);
                    }
                })
                .catch());

        } catch (error) {
            console.log(error);
            return error;
        }
    }, 5000, _id);
};

const getWPAData = (_id) => {
    console.log('getWPAData: ' + _id);
    return new Promise(WPAData.findById(_id)
        .exec()
        .then(result => {
            console.log('WPAData.getWPAData.then(): ' + result);
            return result;
        })
        .catch(error => {
            console.log('WPAData.getWPAData.catch(): ' + error);
            return error
        }), console.log('Promise rejected'));
}

// updatedOps is non-JSON object
const updateWPAData = updatedOps => {
    const id = updatedOps._id;
    WPAData.update({ _id: id }, { $set, updatedOps })
        .exec()
        .then(result => {
            return result;
        })
        .catch(error => {
            return error;
        });
};