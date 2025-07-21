import DbMongoose from './dbMongoose.js'

class DbFactory{
    static create (dbType= 'Mongoose')
    {
        const dbs = new Map()

        dbs.set('Mongoose', DbMongoose)

        const db = dbs.get(dbType)
        return new db()
    }
}
export default DbFactory