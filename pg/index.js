const { Pool } = require('pg')
const config = require('../conf/db')
const pool = new Pool(config)

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})
pool.connect(() => {
    console.warn('connected pg')
})
class PgPool {
    constructor() {

    }
    // callback - checkout a client

    query(sql, params) {
        console.log(sql)
        if (params) {            
            return pool.query(sql, params)
            // .catch(err => {
            //     console.error('Error executing query', err.stack)
            //     return err                   
            // })
        } else {
            return pool.query(sql)
            // .catch(err => 
            //     console.error('Error executing query', err.stack))
        }
    }

}

module.exports = PgPool