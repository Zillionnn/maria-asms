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
const coModel = {
    listAll() {
        try {
            return query('select * from t_co')
        } catch (err) {
            return Promise.reject(err)
        }

    },
    listCount() {
        try {
            return query(`select count(id) from t_co`)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    list(params) {
        try {
            return query('select * from t_co order by name asc offset $1 limit $2', params)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    findOneByName(name) {
        try {
            console.log(name)
            return query('SELECT id,name from t_co where name=$1::text ', [name])
        } catch (err) {
            return Promise.reject(err)
        }

    },
    findOneById(coId) {
        try {
            let params = [coId]
            return query('SELECT * from t_co where id=$1 ', params)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    insertOne(body) {
        try {
            let params = []
            let fieldList = ['name','contact','phone','address']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            return query('INSERT INTO t_co(name,phone,address) VALUES ($1::text,$2,$3);', params)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    delete(params) {
        try {
            return query('DELETE FROM t_co where id=$1', params)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    update(body) {
        try {
            let params = []
            let fieldList = ['id', 'name','contact','phone','address']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            console.log(params)
            return query(`UPDATE t_co
            SET name=$2, contact=$3,phone=$4,address=$5, update_time=now()
            WHERE id=$1;`, params)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}

module.exports = coModel
