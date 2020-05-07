const cp = require('child_process');
const fs = require('fs');
const mongoose = require('mongoose');
const WPAData = require('../api/models/wpaData');


exports.startProcessing = (id) => {
    WPAData.findById(id)
        .exec()
        .then(wpaData => {

            // cp.exec('aircrack-ng -q --new-session ' + apmac + 'session -a2 -b '

        })
        .catch(error => {
            console.log(error);
        });
}




exports.reviewData = wpaData => {
    // const job = setInterval((wpaData) => {
    // getWPAData(_id)
    //     .then(wpaData => {
    console.log('From DB: ' + wpaData);

    switch (wpaData.status) {
        case 'accepted':
            processAccepted(wpaData);
            break;
        case 'processing':
            processProcessing(wpaData);
            break;
        default:

    }

    // const updatedOps = {
    //     _id: wpaData._id,
    //     progress: wpaData.progress + 10,
    //     status: (wpaData.progress + 10) === 40 ? 'finished' : wpaData.status
    // }
    // console.log('Updated updatedOps: ' + updatedOps);
    // for (let key in updatedOps) {
    //     console.log('Key: ' + key + ', value: ' + updatedOps[key]);
    // }
    // const updatedQuery = updateWPAData(updatedOps);
    // if (updatedOps.status === 'finished') {
    //     console.log('Killing interval!');
    //     clearInterval(job);
    // }
    // return updatedQuery;
    // })
    // .catch(error => {
    //     console.log(error);
    //     // res.status(500).json()
    // });
    // }, 10000, _id);
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


const processAccepted = (wpaData) => {
    const capfile = wpaData.capfile;
    const apmac = wpaData.apmac;
    const createdTime = wpaData.createdTime;
    console.log('Timestamp=' + createdTime.getTime());

    wpaData.status = 'processing';
    wpaData.save()
        .then(result => {
            console.log(result);
            console.log('WPAData file save to DB before started processing');

            let dictString = '';
            const dictStringArray = process.env.DICTIONARIES.split(',');
            for (let i = 0; i < dictStringArray.length; i++) {
                // console.log('Process dictionaries: %i %j', process.env.DICTIONARIES_PATH, dict);
                dictString += process.env.DICTIONARIES_PATH + dictStringArray[i];
                if (i < dictStringArray.length - 1) {
                    dictString += ',';
                }
            }
            // dictString = dictString.replace(' ', ',');

            // = process.env.DICTIONARIES.map(dict => {
            //     dictString += process.env.DICTIONARIES_PATH + dict;
            // });

            console.log('Process dictionaries: %j', dictString);
            console.log('aircrack-ng -q -a2' +
                ' --new-session files/aircrack/session_' + apmac + '_' + createdTime.getTime() +
                ' -b ' + apmac +
                ' -w ' + dictString + ' ' + capfile
            );

            cp.exec('aircrack-ng -q -a2' +
                ' --new-session files/aircrack/session_' + apmac + '_' + createdTime.getTime() +
                ' -b ' + apmac +
                ' -w ' + dictString + ' ' + capfile,
                (err, stdout, stderr) => {
                    if (err) {
                        console.log(`err: ${err}`);
                        wpaData.status = 'aircrack_init_error';
                    } else {
                        // the *entire* stdout and stderr (buffered)
                        console.log(`stdout: ${stdout}`);
                        console.log(`stderr: ${stderr}`);

                        if (stdout) {
                            if (stdout.includes('KEY FOUND')) {
                                wpaData.status = 'key_found';
                                wpaData.password = stdout.split(' [ ')[1].split(' ]')[0];
                                console.log(`stdout: ${wpaData.password}`);
                            } else {
                                wpaData.status = 'key_not_found';
                            }
                        } if (stderr) {
                            // stderr
                            wpaData.status = 'aircrack_error';
                        }

                    }

                    wpaData.save()
                        .then(result => {
                            console.log(result);
                            console.log('WPAData file save to DB after finished processing');
                        })
                        .catch(error => {
                            console.log(error);
                            console.log('WPAData file failed to save to DB after finished processing');
                        });

                });
        })
        .catch(error => {
            console.log(error);
            console.log('WPAData file failed to save to DB before started processing');
        });

}

const processProcessing = (wpaData) => {
    setProgress(wpaData);
    checkIfProcessExist(wpaData);
}

const setProgress = (wpaData) => {
    cp.exec('wc -l files/dictionaries/rockyou.txt',
        (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            } else if (stderr) {
                console.log(stderr)
            } else {
                const dictCount = stdout.toString().split(' ')[0];
                readSessionFile(wpaData, dictCount);
            }
        }
    )
}

const readSessionFile = (wpaData) => {
    const pathToFile = 'files/aircrack/session_' + wpaData.apmac + '_' + wpaData.createdTime.getTime();
    console.log(pathToFile);
    fs.readFile(pathToFile, { encoding: 'utf-8' }, (error, data) => {
        if (error) {
            console.log(error);
        } else {
            const lines = data.toString().split('\n');
            console.log(lines.length);
            if (lines.length > 1) {
                const currentDictionaryNumber = Number.parseInt(lines[2].split(' ')[0]);
                const totalDictionaryCount = lines[10].split(',').length;
                const currentCount = lines[2].split(' ')[2];
                const dictName = lines[10].split(',')[currentDictionaryNumber];
                console.log(dictName);
                cp.exec('wc -l ' + dictName,
                    (error, stdout, stderr) => {
                        if (error) {
                            console.log(error);
                        } else if (stderr) {
                            console.log(stderr);
                        } else {
                            const dictCount = stdout.toString().split(' ')[0];

                            console.log(dictName + ',' + currentCount + ',' + dictCount);
                            console.log('Progress of cracking against dictionary "' + dictName +
                                '" (' + (currentDictionaryNumber + 1) + ' of ' + totalDictionaryCount +
                                ') is ' + Math.floor((currentCount / dictCount) * 100) + '%.');
                            wpaData.progress.dictionary = currentDictionaryNumber;
                            wpaData.progress.precentage = Math.floor((currentCount / dictCount) * 100);

                            wpaData.save()
                                .then(result => {
                                    console.log(result);
                                })
                                .catch(error => {
                                    console.log(error);
                                });
                        }

                    }
                )
            }

        }
    });
}

const checkIfProcessExist = (wpaData) => {
    const apmac = wpaData.apmac;
    const timestamp = wpaData.createdTime.getTime();
    cp.exec('ps -aux | grep ' + apmac + '_' + timestamp,
        (error, stdout, stderr) => {
            if (error) {
                console.log(error);
            } else if (stderr) {
                console.log(stderr);
            } else {
                console.log('stdout: ' + stdout.toString());
                const processCount = stdout.toString().split('\n');
                if (processCount > 1) {
                    // success - aircrack is working
                } else {
                    // failed - something went wrong with aircrack and it is not working
                    wpaData.status = 'fail';
                    wpaData.save()
                    .then(result => {
                        console.log(result);
                    })
                    .catch(error => {
                        console.log(error);
                    });
                }
            }
        }
    );
}