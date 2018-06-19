const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const getUserCollection = require('./models/user.js')

module.exports = {
    /**
     *
     * @param user
     * @param pwd
     * @param url
     * @param db
     * @returns {Promise<{db: Db, ObjectID: *, collections: {users}}>}
     */
    startDB: async ({user, pwd, url, db}) => {
        try {
            const client = await MongoClient.connect(`mongodb://${user}:${pwd}@${url}/${db}`)

            const database = client.db(db)

            const collections = {
                users: await getUserCollection(database)
            }
            return {
                db: database,
                ObjectID,
                collections
            }

        } catch (e) {
            console.log(e)
        }
    }
}
