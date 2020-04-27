const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './files/cap_files/');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.originalname.endsWith('.cap')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file extension'), false);
    }
}

const upload = multer({
    storage: storage,

    limits: {
        fileSize: 1024*1024*5
    },
    fileFilter: fileFilter
});

const WPADataController = require('../controllers/wpaData');

// router.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

router.get('/', WPADataController.get_all);

router.get('/:wpaDataId', WPADataController.get);

router.get('/apmac/:macId', WPADataController.getByMAC);

router.post('/', upload.single('capfile'), WPADataController.create);

router.delete('/', WPADataController.deleteAll);

module.exports = router;