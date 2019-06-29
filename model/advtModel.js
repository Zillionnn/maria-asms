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
const advtModel = {
    listAll() {
        try {
            return query('select * from t_advertise')
        } catch (err) {
            return Promise.reject(err)
        }

    },
    listCount() {
        try {
            return query(`select count(*) from t_advertise`)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    list(params) {
        try {
            return query('select * from t_advertise offset $1 limit $2', params)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    findOneByName(name) {
        try {
            console.log(name)
            return query('SELECT id,name from t_advertise where name=$1::text ', [name])
        } catch (err) {
            return Promise.reject(err)
        }

    },
    findOneById(params) {
        try {
            return query('SELECT * from t_advertise where id=$1::uuid ', params)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    insertOne(body) {
        try {
            let params = [],
                fieldList = ['name', 'co_id', 'co_name', 'location', 'lease_time', 'lease_time_unit', 'size']
            fieldList.forEach(k => {
                params.push(body[k])
            })
            return query(`INSERT INTO public.t_advertise(
            name, co_id,co_name, location, lease_time, lease_time_unit, size)
            VALUES ($1,$2, $3,$4, $5::integer, $6::integer, $7);`, params)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    delete(params) {
        try {
            return query('DELETE FROM t_advertise where id=$1', params)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    update(body) {
        try {
            let params = [],
                fieldList = ['id', 'name', 'co_id', 'location', 'lease_time', 'lease_time_unit', 'size','co_name']
            fieldList.forEach(k => {
                params.push(body[k])
            })
            return query(`UPDATE public.t_advertise
       SET name=$2, co_id=$3, location=$4, lease_time=$5, lease_time_unit=$6, size=$7, update_time=now(), co_name=$8  
       WHERE id=$1;`, params)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}

module.exports = advtModel
