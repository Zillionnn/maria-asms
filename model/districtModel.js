const PgPool = require('../pg/index')
const pgPool = new PgPool()
let query = (sql, params) => {
    return pgPool.query(sql, params)
        .then(r => {
            return r.rows
        })
        .catch(err => {
            return Promise.reject(err)
        })
}
const table = 't_district'
const districtModel = {
    listAll() {
        try {
            return query(`select * from ${table}`)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    listCount() {
        try {
            return query(`select count(*) from ${table}`)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    list(params) {
        try {
            return query(`select * from ${table} order by name asc offset $1 limit $2`, params)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    findOneByName(name) {
        try {
            console.log(name)
            return query(`SELECT id,name from ${table} where name=$1::text`, [name])
        } catch (err) {
            return Promise.reject(err)
        }

    },
    findOneById(coId) {
        try {
            let params = [coId]
            return query(`SELECT * from ${table} where id=$1 `, params)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    insertOne(body) {
        try {
            let params = []
            let fieldList = ['name']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            return query(`INSERT INTO ${table}(name) VALUES ($1);`, params)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    delete(params) {
        try {
            return query(`DELETE FROM ${table} where id=$1`, params)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    update(body) {
        try {
            let params = []
            let fieldList = ['id', 'name']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            console.log(params)
            return query(`UPDATE ${table}
            SET name=$2, update_time=now()
            WHERE id=$1;`, params)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}

module.exports = districtModel
