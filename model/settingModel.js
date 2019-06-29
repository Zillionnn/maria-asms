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
const settingModel = {
    listAll() {
        try {
            return query('select * from t_setting')
        } catch (err) {
            return Promise.reject(err)
        }

    },
    insertOne(body) {
        try {
            let params = []
            let fieldList = ['email', 'email_code']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            return query('INSERT INTO t_setting(email, email_code) VALUES ($1::text, $2::text);', params)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    delete(params) {
        try {
            return query('DELETE FROM t_setting where id=$1', params)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    update(body) {
        try {
            let params = []
            let fieldList = ['id', 'email', 'email_code']

            fieldList.forEach(f => {
                params.push(body[f])
            })
            console.log(params)
            return query(`UPDATE t_setting
            SET email=$2, email_code=$3, update_time=now()
            WHERE id=$1;`, params)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}

module.exports = settingModel
