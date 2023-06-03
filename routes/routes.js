const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');

// code to upload image
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single('image');


// insert an user into db   
router.post("/add", upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    user.save().then((err) => { 
        // console.log('alksjfk');
        // if(err) {
        //     console.log('inside if');
        //     res.json({message: err.message, type: 'danger'});
        //     console.log(err);
        // }else {
        //     console.log('inside else');
            req.session.message = {
                type: 'success',
                message: 'user added successfully.',
            };
            res.redirect('/');//
        
    });
    
    // user.save((err) => { 
    //     if(err) {
    //         res.json({message: err.message, type: 'danger'});
    //     }else {
    //         req.session.message = {
    //             type: 'success',
    //             message: 'user added successfully.',
    //         };
    //         res.redirect('/');//
    //     }
    // });
});


// get all users route
router.get('/', (req, res)=> {
    User.find().exec().then((users) => {
            res.render('index',{
                title: 'home page',
                users: users,
            });
        // }
    });
});

// edit an user
router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    User.findById(id).then((user) => {
        // console.log(user);
        if(user == null) {
            res.redirect('/');
        }else{
            res.render('edit_users', {
                title: 'Edit user',
                user: user,
            });
        }

    });
});

// update user
router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id;
    let new_img = '';
    if(req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/'+req.body.old_image);
        } catch(error) {
            console.log(error);
        }
    }else {
        new_image = req.body.old_image;
    }
    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
    }).then((result) => {
        req.session.message = {type:'success', message:'User updated successfully..'};
        res.redirect('/');
    });
});

// delete the user
router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    User.findByIdAndRemove(id).then((result) => {
        console.log(result);
        if(result.image != "") {
            try {
                fs.unlinkSync('./uploads/'+result.image);
            }catch(error) {
                console.log(error);
            }
        }
        req.session.message = {type: 'success', message: 'User deleted successfully'};
        res.redirect('/');
    });
});

router.get('/Users', (req, res)=> {
    res.send("All Users");
});
router.get('/add', (req, res)=> {
    res.render("add_user", {title:"Add user"});
});


module.exports = router;