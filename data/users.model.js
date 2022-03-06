var mongoose = require('mongoose');

var usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required : true
    },
    mobile: {
        type: Number,
        required : true,
        unique:true
    },
    password: {
        type: String,
        required: true
    }, 
    role: {
        type: String, 
        enum : ['Admin', 'Manager', 'Executive'],
        required: true
    },
    branch: { 
        type: String,
        required: true
    }
})

mongoose.model('Users', usersSchema, 'users')
