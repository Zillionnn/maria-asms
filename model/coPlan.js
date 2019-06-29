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
const coPlanModel = {
    listAll() {
        try {
            return query('select * from t_plan')
        } catch (err) {
            return Promise.reject(err)
        }

    },
    listCount() {
        try {
            return query(`select count(id) from t_plan`)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    list(params) {
        try {
            return query('select * from t_plan order by plan_name asc offset $1 limit $2', params)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    findOneByPlanName(name,coId) {
        try {
            console.log(name)
            return query('SELECT * from t_plan where plan_name=$1::text AND co_id=$2', [name,coId])
        } catch (err) {
            return Promise.reject(err)
        }

    },
    /**
     * 查询一个企业所有plan
     * 
     * @param {*} params 
     */
    ListByCoId(coId) {
        try {
            console.log(coId)
            let params = [coId]            
            return query('SELECT * from t_plan where co_id=$1', params)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    insertOne(body) {
        try {
            let params = []
            let fieldList = ['plan_name', 'co_id']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            return query('INSERT INTO t_plan(plan_name, co_id) VALUES ($1, $2);', params)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    deleteByPlanId(planId) {
        try {
            let params = [planId]
            return query('DELETE FROM t_plan where id=$1', params)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    updateOne(body) {
        try {
            let params = []
            let fieldList = ['id', 'plan_name', 'co_id']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            console.log(params)
            return query(`UPDATE t_plan
            SET plan_name=$2, co_id=$3
            WHERE id=$1;`, params)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}

module.exports = coPlanModel
