const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    favoritBooks :{
      type : [String],
      default: []
    }

});

const Member = mongoose.model('Members', MemberSchema);
module.exports = Member;
