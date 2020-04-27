const mongoose = require('mongoose');
const dataProcessor = require('../../logic/dataProcessor');
const wpaDataDao = require('../../db/wpaDataDao');

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
                    password: wpaData.password ? wpaData.password : ''
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
    const id = req.params.wpaDataId;
    WPAData.findById(id)
        .exec()
        .then(result => {
            console.log(result);
            // const result = results[0];
            res.status(200).json({
                result: result
            });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                error: error
            });
        });
}

exports.getByMAC = (req, res, next) => {
    const apmac = req.params.macId;
    WPAData.find({ 'apmac': apmac })
        .exec()
        .then(results => {
            console.log(results);

            const response = results.map(wpaData => {
                return ({
                    _id: wpaData._id,
                    apmac: wpaData.apmac,
                    password: wpaData.password
                });
            })

            res.status(200).json({
                objects: response
            });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                error: error
            });
        });
}

exports.create = (req, res, next) => {
    // console.log("body: %j", req.body);
    // console.log("body: %j", req.file);
    const capfile = req.file.path;
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
            // reviewData(wpaData._id);
            dataProcessor.startProcessing(wpaData._id);
        })
        // wpaDataDao.save(newWPAData)
        // .then(wpaData => {
        //     console.log('create.processData _id: ' + wpaData._id);
        //     // reviewData(wpaData._id);
        //     // dataProcessor.startProcessing();
        // })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                error: error
            });
        })
}

exports.deleteAll = (req, res, next) => {
    WPAData.remove()
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'All objects removed'
            });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                error: error
            });
        });
}



const reviewData = _id => {
    const job = setInterval((_id) => {
        getWPAData(_id)
            .then(wpaData => {
                console.log('From DB: ' + wpaData);
                const updatedOps = {
                    _id: wpaData._id,
                    progress: wpaData.progress + 10,
                    status: (wpaData.progress + 10) === 40 ? 'finished' : wpaData.status
                }
                console.log('Updated updatedOps: ' + updatedOps);
                for (let key in updatedOps) {
                    console.log('Key: ' + key + ', value: ' + updatedOps[key]);
                }
                const updatedQuery = updateWPAData(updatedOps);
                if (updatedOps.status === 'finished') {
                    console.log('Killing interval!');
                    clearInterval(job);
                }
                return updatedQuery;
            })
            .catch(error => {
                console.log(error);
                // res.status(500).json()
            });
    }, 5000, _id);
};

const getWPAData = (_id) => {
    return WPAData.findById(_id)
        .exec();//returning promise
}

// updatedOps is non-JSON object
const updateWPAData = updatedOps => {
    const id = updatedOps._id;
    return WPAData.updateOne({ _id: id }, { $set: updatedOps })
        .exec();//returning promise
};