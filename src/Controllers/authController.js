const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("./config")

const { UserModel } = require('../Models/userSchema');

const register = async (req, res) => {

    let hashPassword = bcrypt.hashSync(req.body.password, 8);
    const userdata = {
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
        phone: req.body.phone,
        role: req.body.role ? req.body.role : "User"
    }
    const userfind = await UserModel.findOne({email : req.body.email})
    if (!userfind) {
        const final = await UserModel.create(userdata)
            .then(data => {
                res.status(200).send("Registration Successfully")
            })
            .catch(err => {
                res.status(500).send("Error While Registration")
            })   
    }
    else {
        res.send("User Already Exist")
    }
}

const login = (req, res) => {
    UserModel.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            return res.status(500).send({ auth: false, token: "Error" })
        }
        if (!user) {
            return res.status(200).send({ auth: false, token: "No User Found Register First" })
        }
        else {
            const passIsValid = bcrypt.compareSync(req.body.password, user.password)
            if (!passIsValid) {
                return res.status(200).send({ auth: false, token: "Invalid Password" })
            }
            let token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 })
            res.status(200).send({auth : true, token: token})
        }
    })
}

const userInfo = (req,res) => {
    let token = req.headers["x-access-token"];
    console.log(token);
    if (!token) {
        res.send({auth : false, token : "No Token Provided"})
    }
    else {
        jwt.verify(token, config.secret, (err, user) =>{
            console.log(user);
            if (err) {
                res.status(200).send({auth : false, token : "Invalid Token"})
            }
            else {
                UserModel.findById(user.id, (err,result) => {
                    res.send(result+ "ok")
                })
            }
        })
    }
}

const deleteUsers = (req,res)  => {
    UserModel.remove({}, (err,data) => {
        if (err) throw err;
        res.send("User Deleted")
    })
}


module.exports = {
    register,
    login,
    deleteUsers,
    userInfo
}