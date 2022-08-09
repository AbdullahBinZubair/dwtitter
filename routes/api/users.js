const express = require('express');
const router = express.Router();
const User = require ('../../models/User');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken'); 
const {check, validationResult} = require('express-validator');
const gravatr = require('gravatar');
const config = require('config');


router.get('/', (req,res) => res.send('User route'));

router.post('/',[
    check('name', 'Name is required').not().isEmpty(),
    check('email',' Email is required').isEmail(),
    check('password', 'Password length should be more than 5').isLength({ min: 6 })
], 
    async(req, res) => 
    {
        const errors = validationResult(req);
        console.log(req.body);
        if (!errors.isEmpty()){
            return res.status(400).json({ errors : errors.array()});
        }
        const { name, email, password } = req.body;
        
        
        try{
            let  user = await User.findOne({email});
            if (user)
            {
                res.status(400).json({errors: [{msg: "That user exist already:"}]});
            }

            const avatar = gravatr.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });

            user = new User({
                name,
                email,
                avatar,
                password
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
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
            console.log(error.message);
            res.status(500).send(error);
        }

    

});


module.exports = router;

