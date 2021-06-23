const db = require('../models')
const config = require('../config/auth.config')
const User = db.user

let jwt = require('jsonwebtoken')
let bcrypt = require('bcryptjs')

const USERPASSWORDFAILED = 'User not found Or Invalid Password'

exports.signup = (req, res) => {
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    })
        .then(user => {
            res.send(user)
        })
        .catch(err => {
            res.status(500).send({
                message: err.message
            })
        })
}

exports.signin = (req, res) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    })
        .then(user => {
            if (!user) {
                return res.status(401).send({message: USERPASSWORDFAILED, accessToken: null})
            }
            let passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            )
            if (!passwordIsValid) {
                return res.status(401).send({message: USERPASSWORDFAILED, accessToken: null})
            }
            let token= jwt.sign({id: user.id}, config.secret, {
                expiresIn: 86400
            })
            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                accessToken: token

            })
        })
        .catch(err => {
            res.status(500).send({
                message: err.message
            })
        })
}