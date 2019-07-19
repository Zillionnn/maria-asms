/****
 * 方案表
 * 生产草稿
 * 确认的方案在areaAdvtarea
 * 
 */
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
            return query('select * from t_co_advt_plan')
        } catch (err) {
            return Promise.reject(err)
        }

    },
    listCount() {
        try {
            return query(`select count(id) from t_co_advt_plan`)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    list(params) {
        try {
            return query('select * from t_co_advt_plan order by plan_name asc offset $1 limit $2', params)
        } catch (err) {
            return Promise.reject(err)
        }

    },

    listByNameCount(body) {
        try {
            let params = []
            let fieldList = ['offset', 'limit', 'plan_name']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            return query('select * from t_co_advt_plan where plan_name=$3 order by plan_name asc offset $1 limit $2', params)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    listByName(body) {
        try {
            let params = []
            let fieldList = ['offset', 'limit', 'plan_name']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            return query('select * from t_co_advt_plan where plan_name=$3 order by plan_name asc offset $1 limit $2', params)
        } catch (err) {
            return Promise.reject(err)
        }
    },

    listByCoCount(body) {
        try {
            let params = []
            let fieldList = ['offset', 'limit', 'plan_name']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            return query('select count(*) from t_co_advt_plan where co_id=$3 offset $1 limit $2', params)
        } catch (err) {
            return Promise.reject(err)
        }
    },
    listByCo(body) {
        try {
            let params = []
            let fieldList = ['offset', 'limit', 'co_id']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            return query('select * from t_co_advt_plan where co_id=$3  offset $1 limit $2', params)
        } catch (err) {
            return Promise.reject(err)
        }
    },

    findOneByName(name) {
        try {
            console.log(name)
            return query('SELECT * from t_co_advt_plan where plan_name=$1::text ', [name])
        } catch (err) {
            return Promise.reject(err)
        }

    },
    findOneById(params) {
        try {
            return query('SELECT * from t_co_advt_plan where id=$1 ', params)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    insertOne(body) {
        // 1 update t_plan
        // 2 insert t_co_advt_plan
        //         INSERT INTO t_co_advt_plan(plan_name)
        // SELECT 'zhangsan'
        // UNION ALL
        // SELECT 'lisi'
        // UNION ALL
        // SELECT 'wangwu' ;
        try {
            console.log('------------coAdvtPlanModel -------insertOne-------->>>\n', body)
            let params = []
            let fieldList = [
                'plan_name',
                'co_id',
                'co_name',
                'advt_space_id',
                'plan_id',
                'section',
                'area_id',
                'area_name',
                'area_location',
                'advt_space_position',
                'advt_space_position_des',
                'isrented']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            return query(`INSERT INTO t_co_advt_plan(plan_name, co_id, co_name, advt_space_id, plan_id, section,
                area_id,
            area_name,
            area_location,
            advt_space_position,
            advt_space_position_des,
            isrented) VALUES ($1, $2, $3, $4, $5,$6,$7,$8,$9,$10,$11,$12);`, params)
        } catch (err) {
            return Promise.reject(err)
        }

    },
    delete(params) {
        try {
            return query('DELETE FROM t_co_advt_plan where id=$1', params)
        } catch (err) {
            return Promise.reject(err)
        }
    },

    update(body) {
        try {
            let params = []
            let fieldList = ['id', 'plan_name', 'co_id', 'co_name', 'advt_space_id']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            console.log(params)
            return query(`UPDATE t_co_advt_plan
            SET plan_name=$2,co_id=$3,co_name=$4,advt_space_id=$5, update_time=now()
            WHERE id=$1;`, params)
        } catch (err) {
            return Promise.reject(err)
        }
    },

    /**
     * 更新出租情况
     */
    updateRent(body) {
        try {
            let params = []
            let fieldList = ['id', 'isrented']
            fieldList.forEach(f => {
                params.push(body[f])
            })
            console.log(params)
            return query(`UPDATE t_co_advt_plan
            SET isrented=$2, update_time=now()
            WHERE id=$1;`, params)
        } catch (err) {
            return Promise.reject(err)
        }
    },

    /**
     * 按plan id 查
     * @param {*} plan_id 
     */
    listByPlanId(plan_id) {
        try {
            let params = [plan_id]
            console.log(params)
            return query(`select * from t_co_advt_plan where plan_id=$1`, params)
        } catch (err) {
            return Promise.reject(err)
        }
    },


    /**
     * 按plan id删除方案
     */
    deleteByPlanId(planId) {
        try {
            return query('DELETE FROM t_co_advt_plan where plan_id=$1', [planId])
        } catch (err) {
            return Promise.reject(err)
        }
    },

    deleteById(id) {
        try {
            return query(`DELETE FROM t_co_advt_plan where id=$1`, [id])
        }
        catch (err) {
            return Promise.reject(err)
        }
    },

    /**
     * 按区域名称查
     */
    listBySectionNameAndPlanId(sectionName, planId) {
        try {
            return query(`select * FROM t_co_advt_plan where section=$1 and plan_id =$2 order by area_name ASC;`, [sectionName, planId])
        }
        catch (err) {
            return Promise.reject(err)
        }
    }
}

module.exports = coPlanModel
