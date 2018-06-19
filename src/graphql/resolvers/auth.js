const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {getUserObj} = require('../utils/userHelpers')
const APP_SECRET = 'super-secret-app-key-pt'

/**
 * @description generates a user token based on userId and app secret
 * @param userId
 * @returns {*}
 */
const generateToken = userId =>
    jwt.sign({userId}, process.env.APP_SECRET || APP_SECRET)

/**
 * @description returns userId from generated token
 * @param ctx
 * @returns {*}
 */
const getUserIdFromContext = req => {
    const Authorization = req.get('Authorization')
    if (Authorization) {
        const token = Authorization.replace('Bearer ', '')
        const {userId} = jwt.verify(token, APP_SECRET)
        return userId
    }

    throw new Error('error_token_not_valid')
}

module.exports = {
    Query: {
        me: async (parent, ctx, {collections, req, ObjectID}) => {
            const _id = getUserIdFromContext(req)
            const user = await collections.users.findOne({_id: ObjectID(_id)})
            Object.assign(user, {
                _id: user._id.valueOf()
            })
            return user
        }
    },
    Mutation: {
        signup: async (parent, {email, firstName, lastName, password}, {collections, ObjectID}) => {
            const hashed = await bcrypt.hash(password, 10)
            const form = getUserObj({email, firstName, lastName})
            Object.assign(form, {
                services: {
                    password: {
                        bcrypt: hashed
                    }
                }
            })
            // save the post
            try {
                const res = await collections.users.insertOne(
                    form
                )
                const user = await collections.users.findOne({_id: ObjectID(res.insertedId)})
                return {
                    token: generateToken(res.insertedId),
                    user: Object.assign(user, {_id: user._id.valueOf()})
                }
            } catch (e) {
                console.error(e)
                throw new Error(e)
            }
        },
        login: async (parent, {email, password}, {collections}) => {
            const user = await collections.users.findOne({
                username: email
            })
            if (!user) {
                throw new Error(`No user found for email: ${email}`)
            }
            try {
                const valid = await bcrypt.compare(
                    password,
                    user.services.password.bcrypt
                )
                if (!valid) {
                    throw new Error('Invalid password')
                }
                return {
                    token: generateToken(user._id),
                    user: Object.assign(user, {_id: user._id.valueOf()})
                }
            } catch (e) {
                throw new Error(e)
            }
        }
    }
}
