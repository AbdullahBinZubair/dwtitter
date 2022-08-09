const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require ('jsonwebtoken'); 
const bcrypt = require ('bcryptjs');
const {check, validationResult} = require('express-validator');
const gravatr = require('gravatar');
const config = require('config');
router.get('/',auth , async (req,res) => {
    
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
        }catch(err){
            console.log (err.message);
            res.status(500).send('Server error');
        }
});

router.post('/',[
    check('email',' Email is required').isEmail(),
    check('password', 'Password is required').exists()
], 
    async(req, res) => 
    {
        const errors = validationResult(req);
        console.log(req.body);
        if (!errors.isEmpty()){
            return res.status(400).json({ errors : errors.array()});
        }
        const { email, password } = req.body;
        
        
        try{
            let  user = await User.findOne({email});
            
            if (!user)
            {
                return res.status(400).json({errors: [{msg: "Invalid Credentials!"}]});
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch){
                return res.status(400).json({errors: [{msg: "Invalid Credentials!"}]});
            }
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload, 
                config.get('jwtToken'),
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
                );
        }catch(error){
            console.log(error);
            res.status(500).send(error);
        }

    

});


module.exports = router;