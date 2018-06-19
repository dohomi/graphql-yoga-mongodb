const user = require('./resolvers/user')
const auth = require('./resolvers/auth')

module.exports = {
    Query: Object.assign(user.Query, auth.Query),
    Mutation: Object.assign(user.Mutation, auth.Mutation),
    Subscription: Object.assign(user.Subscription)
}
