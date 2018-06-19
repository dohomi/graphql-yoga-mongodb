// create a new post
const {getUserObj} = require('../utils/userHelpers')
const {withFilter} = require('graphql-yoga')

const MutationTypes = {
    created: 'CREATED',
    updated: 'UPDATED',
    deleted: 'DELETED'
}

const MutationTriggers = {
    user: 'user' // must/should match subscription name
}

/**
 *
 * @param mutationType
 * @param node
 * @param trigger
 * @param pubSub
 * @param collection
 */
async function publishChange ({mutationType, node, trigger}, pubSub, collection) {
    if (!mutationType || !node || !trigger || !pubSub || !collection) {
        throw new Error('One or more required fields not set on publishChange function')
    }

    const object = await collection.findOne({_id: node._id})
    object._id = object._id.toString() // get _id string
    pubSub.publish(MutationTriggers[trigger], {
        // first field musst match subscription name
        [MutationTriggers[trigger]]: {
            mutationType,
            node: object
        }
    })
}

module.exports = {
    Query: {
        users: async (parent, args, {collections}) => {
            try {
                const users = await collections.users.find()
                return users.toArray()
            } catch (e) {
                console.log(e)
                throw new Error('Cannot fetch User!!!')
            }
        }
    },
    Mutation: {
        updateUser: async (parent, {_id, email, firstName, lastName}, {collections, ObjectID, pubSub}) => {
            const form = getUserObj({email, firstName, lastName})
            try {
                delete form._id // need to remove the _id modifier
                const res = await collections.users.updateOne(
                    {_id: ObjectID(_id)},
                    {$set: form}
                )
                if (res.matchedCount !== 1) {
                    throw new Error('error.user_not_found')
                }
                await publishChange({
                        mutationType: MutationTypes.updated,
                        trigger: MutationTriggers.user,
                        node: {_id: ObjectID(_id)}
                    },
                    pubSub,
                    collections.users
                )
                return res
            } catch (e) {
                console.log(e)
                throw new Error(e.message)
            }

        },
        createUser: async (parent, {email, firstName, lastName}, {collections, pubSub}) => {
            const form = getUserObj({email, firstName, lastName})
            // save the post
            try {
                const res = await collections.users.insertOne(
                    form
                )
                await publishChange({
                        mutationType: MutationTypes.created,
                        trigger: MutationTriggers.user,
                        node: {_id: res.insertedId}
                    },
                    pubSub,
                    collections.users)
                return res
            } catch (e) {
                console.log(e)
                throw new Error(e)
            }
        }
    },
    Subscription: {
        user: {
            // can define resolver in case its needed to change output
            subscribe: withFilter(
                (parent, args, {pubSub}) => pubSub.asyncIterator(MutationTriggers.user),
                ({user: {mutationType}}, args) => {
                    // some more complex logic for auth and granular subscriptions
                    const filterMutationType = args && args.where && args.where.mutation_in
                    if (Array.isArray(filterMutationType)) {
                        return filterMutationType.includes(mutationType)
                    }
                    // default: don't trigger change if not properly set with vars (for testing purpose)
                    return false
                }
            )
        }
    }
}
