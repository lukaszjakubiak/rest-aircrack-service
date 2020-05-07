const mongoose = require('mongoose');
const dataProcessor = require('../../logic/DataProcessor');
const wpaDataDao = require('../../db/wpaDataDao');

const WPAData = require('../models/wpaData');

exports.get_all = (req, res, next) => {
    WPAData.find()
        .exec()
        .then(results => {
            console.log(results);
            const objects = results.map(wpaData => {
                return (
                    //     {
                    //     _id: wpaData._id,
                    //     capfile: wpaData.capfile,
                    //     apmac: wpaData.apmac,
                    //     status: wpaData.status,
                    //     progress: wpaData.progress,
                    //     password: wpaData.password ? wpaData.password : ''
                    // }
                    wpaData
                );
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
    // console.log(process);
    // console.log('process.env %j', process.env);
    // console.log('process.env.aircrack ' + process.env.aircrack);

    const dictionaries = process.env.DICTIONARIES;
    console.log(dictionaries);
    console.log(process.env.MONGO_ATLAS_PW);
    console.log(process.env.DICTIONARIES_PATH);
    const newWPAData = new WPAData({
        _id: mongoose.Types.ObjectId(),
        capfile: capfile,
        apmac: apmac,
        createdTime: Date.now(),
        dictionaries: dictionaries
    });
    // console.log(newWPAData);
    newWPAData.save()
        .then(wpaData => {
            console.log(wpaData);
            // res.status(200).json({
            //     _id: wpaData._id,
            //     capfile: wpaData.capfile,
            //     apmac: wpaData.apmac,
            //     status: wpaData.status
            // });
            res.status(200).json(wpaData);
            console.log('create.processData _id: ' + wpaData._id);
            // reviewData(wpaData._id);
            // dataProcessor.startProcessing(wpaData._id);
        })
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

