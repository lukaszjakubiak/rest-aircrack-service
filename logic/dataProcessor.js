const cp = require('child_process');
const mongoose = require('mongoose');

const WPAData = require('../api/models/wpaData');

exports.startProcessing = (id) => {
    WPAData.findById(id)
        .exec()
        .then(wpaData => {
            const capfile = wpaData.capfile;
            const apmac = wpaData.apmac;

            wpaData.status = 'processing';
            wpaData.save()
                .then(result => {
                    console.log(result);
                    console.log('WPAData file save to DB before started processing');
                    
                    cp.exec('aircrack-ng -q -a2 -b '
                        + apmac + ' -w files/dictionaries/babeczkaduracell.txt ' + capfile,
                        (err, stdout, stderr) => {
                            if (err) {
                                console.log(`err: ${err}`);
                                wpaData.status = 'key_not_found';
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
                                    }
                                } else {
                                    wpaData.status = 'processed';
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

            // cp.exec('aircrack-ng -q --new-session ' + apmac + 'session -a2 -b '

        })
        .catch(error => {
            console.log(error);
        });

}