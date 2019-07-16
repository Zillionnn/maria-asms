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
const planSectionModel = {
    /**
     * 按 区域 plan id 查 列表
     * @param {*} planId 
     * @param {*} section 
     */
    listByPlanId(planId) {
        try {
            return query(`select * from t_plan_section where plan_id=$1;`, [planId]);
        } catch (err) {
            return Promise.reject(err);
        }
    },
    /**
     * 按planid  section  统计 数目
     * @param {*} planId 
     * @param {*} section 
     */
    countByPlanIdAndSection(planId, section) {
        try {
            return query(`select count(*) from t_plan_section where plan_id=$1 and section=$2;`, [planId, section]);
        } catch (err) {
            return Promise.reject(err);
        }
    },
    /**
     * 插入一条记录
     * @param {} planId 
     * @param {*} section 
     */
    insertOne(planId, section) {
        try {
            return query(`INSERT INTO t_plan_section(plan_id, section) VALUES ($1, $2);`, [planId, section]);
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
            return query(`UPDATE t_plan_section
            SET plan_name=$2, co_id=$3
            WHERE id=$1;`, params)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}

module.exports = planSectionModel
