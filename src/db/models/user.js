const validation = {
    $jsonSchema: {
        bsonType: 'object',
        additionalProperties: false,
        required: ['username'],
        uniqueItems: ['username'],
        properties: {
            _id: {
                bsonType: 'objectId'
            },
            username: {
                bsonType: 'string',
                required: true
            },
            profile: {
                bsonType: 'object',
                additionalProperties: false,
                required: ['firstName'],
                properties: {
                    _id: {
                        bsonType: 'objectId'
                    },
                    firstName: {
                        bsonType: 'string'
                    },
                    lastName: {
                        bsonType: 'string'
                    },
                    name: {
                        bsonType: 'string'
                    }
                }
            },
            services: {
                bsonType: 'array',
                additionalProperties: false,
                properties: {
                    google: {
                        bsonType: 'object'
                    },
                    password: {
                        bsonType: 'object',
                        additionalProperties: false,
                        properties: {
                            bcrypt: {
                                bsonType: 'string'
                            }
                        }
                    },
                    facebook: {
                        bsonType: 'object'
                    },
                    resume: {
                        bsonType: 'object'
                    }
                }
            },
            emails: {
                bsonType: 'array',
                additionalProperties: false,
                uniqueItems: ['address'],
                properties: {
                    address: {
                        type: 'string',
                        pattern: '^$|^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$',
                        description: 'validation.unique_email'
                    },
                    verified: {
                        bsonType: 'boolean'
                    },
                    dropped: {
                        bsonType: 'object'
                    }
                }
            }
        }
    }
}
/**
 *
 * @param db
 * @returns {Promise|*}
 */
module.exports = function (db) {
    try {
        return db.createCollection('users', {validator: validation})
    } catch (e) {
        console.log(e)
        throw new Error(e)
    }
}
