const express =require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const config = require('config');
const request = require('request');
const {check, validationResult} = require('express-validator');
const User = require('../../models/User');
const { findOne } = require('../../models/Profile');
//@route GET api/profile/me
router.get('/me', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({user: req.user.id}).populate('user',['name','avatar']);
        if (!profile){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }
        res.json(profile);
    }catch(err){
        console.log(err);
        res.status(500).send('Server Error');
    }
});

//@route POST api/profile Create or update user profile

router.post('/', [auth, [
    check('status', 'Status is required')
    .not()
    .isEmpty(),
    check('skills','Skills is required').not().isEmpty()
    ]
],
async (req,res) => {
    const errors= validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location ;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status ;
    if (githubusername) profileFields.githubusername = githubusername ;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    } 

    // Build social object
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try{
        let profile = await Profile.findOne({user: req.user.id});
       // console.log(profile);
        if (profile){
            //updating
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields},
                {new: true}
            );
           // console.log(profile);
                return res.json(profile);
        }
        //Creating
        profile = new Profile(profileFields);
        
        await profile.save();
        return res.json(profile);
    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }

    console.log(profileFields.skills);
    
    res.send("Hello");
} 
);

//@ROUTE GET api/profile get all profiles

router.get ('/', async (req, res) => {
    try{
        const profiles= await Profile.find().populate('user',['name','avatar']);
        res.json(profiles);
    }catch(err){
        console.log(err);
        res.status(500).send('Server Error');
    }
});

//@ROUTE GET api/profile/user/userID get  profile of a user

router.get ('/user/:user_id', async (req, res) => {
    try{
        const profile= await Profile.findOne({user : req.params.user_id}).populate('user',['name','avatar']);
        if (!profile){
            return res.status(400).json({msg : 'There is no such user exist:'});
        }
        return res.json(profile);
    }catch(err){
        console.log(err);
        if (err.kind == 'ObjectId'){
            return res.status(400).json({msg : 'There is no such user exist: '});
        }
        return res.status(500).send('Server Error');
    }
});

//@router /api/profile delete a profile, user or post
router.delete('/', auth, async (req,res) => {
    try{
        let resp = await Profile.findOneAndDelete({user : req.user.id});
        await User.findOneAndRemove({ id: req.user_id});
        res.json({msg : 'User Deleted'});
    }catch (err){
        console.log(err);
        res.status(500).json({msg: 'Server Error'});
    }
});
//@route PUT api/profile/experience add profile experience

router.put('/experience', [ auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company','Company is required').not().isEmpty(),
    check('from','From date is required:').not().isEmpty()
]  ], async (req,res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        const{
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;
        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        };
        try {
            let profile = await Profile.findOne({user:req.user.id});

            profile.experience.unshift(newExp);
            await profile.save();

            res.json(profile);

        }catch(err){
            console.log(err);
            res.status(500).json('Server Error');
        }
    }
);

//@route DELETE api/profile/experience/:exp_id Delete experience from profile
router.delete('/experience/:exp_id', auth, async (req,res) => {
    try{
        const profile = await Profile.findOne({user: req.user.id});

        const removeableIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeableIndex, 1);

        await profile.save();
        res.json(profile);
    }catch(err){
        console.log(err);
        res.status(500).json('Server Error');
    }
} );

//@route PUT api/profile/education add profile education

router.put('/education', [ auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree','Degree is required').not().isEmpty(),
    check('fieldofstudy','Field Of Study is required').not().isEmpty(),
    check('from','From date is required:').not().isEmpty(),
    check('to','To date is required:').not().isEmpty()
]  ], async (req,res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        const{
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;
        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        };
        try {
            let profile = await Profile.findOne({user:req.user.id});
            console.log("///////////////");
            profile.education.unshift(newEdu);
            await profile.save();

            res.json(profile);

        }catch(err){
            console.log(err);
            res.status(500).json('Server Error');
        }
    }
);

//@route DELETE api/profile/education/:edu_id Delete education from profile
router.delete('/education/:edu_id', auth, async (req,res) => {
    try{
        const profile = await Profile.findOne({user: req.user.id});

        const removeableIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeableIndex, 1);

        await profile.save();
        res.json(profile);
    }catch(err){
        console.log(err.message);
        res.status(500).json('Server Error');
    }
} );
//@route GET api/profile/github/:username get user repos from github

router.get('/github/:username', (req,res) =>{
    try{
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}$client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'} 
        };
    request(options, (errors, response, body) =>{
        if (errors) console.log(errors);
        if (response.statusCode !== 200) {
            res.status(404).json({ msg: 'No Github profile found'});
        }
        res.json(JSON.parse(body));
    });
    }catch (err){
        console.log(err.message);
        res.status(500).json("Server Error");
    }
})
module.exports = router;
