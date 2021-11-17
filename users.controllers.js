var mongoose = require('mongoose');
var User = mongoose.model('Users');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

//Create a new User
module.exports.register = function (req, res) {
    console.log('Registering a new User' + JSON.stringify(req.body)); 
    console.log(req.body);
    var name = req.body.name;
    var mobile = parseInt(req.body.mobile, 10);
    var password = req.body.password;
    var role = req.body.role;
    var branch = req.body.branch;
    var params = { 
        name : name, 
        mobile : mobile, 
        password : bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
        role : role,
        branch : branch
    };
    User
        .create(params, function(err, user){
        if(err) {
            console.log(err);
            res
                .status(400)
                .json(err);
        }
        else { 
            console.log("User Created", user);
            res
                .status(201)
                .json({success: true, user: user})
        }            
    });
};

//Login 
module.exports.login = function (req, res) {
    console.log('Logging in User' + JSON.stringify(req.body)); 
    var mobile = parseInt(req.body.mobile, 10);
    var password = req.body.password; 
  
    User
    .findOne({
        mobile : mobile
    })
    .exec(function(err, user) {
        if (err) {
          console.log(err);
          res.status(400).json(err);
        } 
        else {
          if (bcrypt.compareSync(password, user.password)) {
            console.log('User found', user);
            var token = jwt.sign({ mobile: user.mobile }, 'shrishti', { expiresIn: 3600 });
            res.status(200).json({success: true, token: token, user: user});
          } 
          else {
            res.status(401).json('Invalid Credentials');
          }
        }
    });
};

module.exports.authenticate = function(req, res, next) {
    var headerExists = req.headers.authorization;
    if (headerExists) {
      var token = req.headers.authorization.split(' ')[1]; //--> Authorization Bearer xxx
      jwt.verify(token, 'shrishti', function(error, decoded) {
        if (error) {
          console.log(error);
          res.status(401).json('Unauthorized');
        } else {
          req.user = decoded.username;
          console.log("Token Successfully Authorized");
          next();
        }
      });
    } else {
      res.status(403).json('No token provided');
    }
  };

//Change Password
module.exports.changePassword = function(req,res){
    
  var userID = req.params.userID;
  var oldpassword = req.body.oldpassword;
  var newpassword = req.body.newpassword;
  //FindOne based on MongoDB object ID 
  console.log("GET userID", userID);
  User
      .findById(userID)
      .exec(function(err, doc){
          var response = {
              status : 200,
              message : doc 
          }; 
          if(err){
              console.log("Error finding User");
              response.status = 500;
              response.message = err;
          } else if(!doc){
              response.status = 404;
              response.message = { "message" : "User record Not found"} ;
          }
          if (response.status !== 200){
              res
              .status(response.status)
              .json(response.message); 
          } else {
                if(bcrypt.compareSync(oldpassword, doc.password))
                    doc.password = bcrypt.hashSync(req.body.newpassword, bcrypt.genSaltSync(10));
                else 
                    res.json("Incorrect old password");
          }
          //save to mongodb with callback function
          doc.save(function(err, userUpdated){
             if (err){
                  console.log("Error updating user");
                  res 
                      .status(500)
                      .json(err);
             } else {
                  res
                     .status(204)
                     .json({success : true, message : 'User Password Changed Successfully'})
              }
          });
      }); 
};

//Update User
module.exports.updateUser = function(req,res){
    
  var userID = req.params.userID;
  //FindOne based on MongoDB object ID 
  console.log("GET userID", userID);
  User
      .findById(userID)
      .exec(function(err, doc){
          var response = {
              status : 200,
              message : doc 
          }; 
          if(err){
              console.log("Error finding User");
              response.status = 500;
              response.message = err;
          } else if(!doc){
              response.status = 404;
              response.message = { "message" : "User record Not found"} ;
          }
          if (response.status !== 200){
              res
              .status(response.status)
              .json(response.message); 
          } else {
              doc.mobile = parseInt(req.body.mobile, 10);
              doc.branch = req.body.branch;
              //doc.passowrd = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
          }
          //save to mongodb with callback function
          doc.save(function(err, userUpdated){
             if (err){
                  console.log("Error updating user");
                  res 
                      .status(500)
                      .json(err);
             } else {
                  res
                     .status(204)
                     .json({success : true, message : 'User Details Updated'})
              }
          });
      });
};

//Delete a User 
module.exports.deleteUser = function(req, res){
  var userID = req.params.userID;
  var adminID = req.body.adminID; 
  var password = req.body.password;
  User 
    .findById(adminID)
    .exec(function(err, admin){
        if(err){
            res
                .status(404)
                .json(err);
        } 
        else {
            if(bcrypt.compareSync(password, admin.password)){
                User
                    .findByIdAndRemove(userID)
                    .exec(function(err, user){
                        if(err){
                            res
                                .status(404)
                                .json(err);
                        } 
                        else {
                            console.log("User Removed. ID: ", userID);
                            res 
                                .status(204)
                                .json({success : true});
                        }
                    });
            }
            else {
                res
                    .status(404)
                    .json("Incorrect Admin Password")    
            }
        }
    }
)};

//Get All Users 
module.exports.usersGetAll = function(req, res){ 
    User
        .find()
        .exec(function(err, users){
            if(err){
                console.log("Error finding users")
                res
                    .status(500)
                    .json(err)
            }
            else {
                console.log("Found Users : ", users.length)
                res
                    .json(users)
            }
        })
}

//Get One User 
module.exports.usersGetOne = function(req, res){
    var userID = req.params.userID; 
    User 
        .findById(userID)
        .exec(function(err, user){
            if(err){
                console.log("Error finding User");
                res
                    .status(500)
                    .json(err)
            }
            else {
                res
                    .status(200)
                    .json(user)
            }
        });
};
  

//Store name array 
//Get One User 
module.exports.looping = function(req, res){

    let name = []
    let stringName = "Field Services"

    for(let i=0; i<1000;i++){
        name[i] = $i + "Field Services"
    }
    console.log("printing name : ", name[i])
    console.log("printing a sample webhook commit");

};
  
// 'Authorization' : 'Basic '+Buffer.from('admin'+':'+'CZ7drlbxRDG7').toString('base64')
