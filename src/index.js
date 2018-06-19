const {GraphQLServer, PubSub, withFilter} = require('graphql-yoga')
const {startDB} = require('./db')
const resolvers = require('./graphql/resolvers')

async function startServer () {
    const {db, collections, ObjectID} = await startDB({
        user: 'graphql',
        pwd: 'yoga123',
        db: 'graphqlYoga',
        url: 'localhost:27017'
    })
    const pubSub = new PubSub()
    const context = (req) => ({
        req: req.request,
        db,
        collections,
        ObjectID,
        pubSub,
        withFilter
    })

    const Server = new GraphQLServer({
        typeDefs: `${__dirname}/graphql/schema.graphql`,
        resolvers,
        context
    })

    // options
    const opts = {
        cors: {
            credentials: true,
            origin: ['http://localhost:8080', 'http://localhost:3000'] // here define the origins
        },
        port: 4000
    }

    Server.start(opts, () => {
        console.log(`Server is running on http://localhost:${opts.port}`)
    })
}

return startServer()

