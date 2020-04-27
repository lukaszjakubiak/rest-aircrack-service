// const mongoose

exports.save = (wpaData) => {
    console.log(wpaData);
    return wpaData.save();
        // .then(wpaData => {
        //     console.log(wpaData);
        //     res.status(200).json({
        //         _id: wpaData._id,
        //         capfile: wpaData.capfile,
        //         apmac: wpaData.apmac,
        //         status: wpaData.status
        //     });
        //     // console.log('create.processData _id: ' + wpaData._id);
        //     // reviewData(wpaData._id);
        //     // dataProcessor.startProcessing();
        // });
}