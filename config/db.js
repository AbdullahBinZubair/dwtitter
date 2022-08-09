const mongoo = require('mongoose');
const config = require('config');

const db = config.get('mongooURI');

const connectDB = async () => {
    try {
        await mongoo.connect(db);
        console.log('MongooDb connected..');
    }catch (err){
        console.log(err);
        //Exit with failure
        process.exit(1);
    }
};

module.exports = connectDB;