const coPlanModel = require('../model/coAdvtPlanModel.js')
const coModel = require('../model/coModel.js')
const planModel = require('../model/coPlan.js')
const areaAdvtModel = require('../model/areaAdvtModel.js')
const planSectionModel = require('../model/planSectionModel.js');

const util = require('../utils/index')

function generateParams(p, b) {
    for (let i in b) {
        p.push(b[i])
    }
    return p
}
const coAdvtPlanCtrl = {
    /**
     * 某个企业的草稿方案list
     * @param {*} ctx 
     * 1. query t_plan  return plan name list by co_id
     * 2. query space list by plan_name and co_id
     * data:[
     *      {
     *       plan: xxx,
     *       data:[...]
     *       },
     *       {
     *          ...
     *        }
     *     ]
     */
    async listByCo(ctx) {
        let body = ctx.params
        console.log(body)
        let coId = body.coId;
        let co = await coModel.findOneById(coId)
        let coName = co[0].name
        let planIdList = await planModel.ListByCoId(coId)
        let data = []
        for (let item of planIdList) {
            let coAdvtPlanList = await coPlanModel.listByPlanId(item.id)

            data.push({
                plan_id: item.id,
                plan_name: item.plan_name,
                co_id: item.co_id,
                data: coAdvtPlanList
            })
        }
        ctx.response.body = {
            code: 0,
            message: 'success',
            coName: coName,
            data: data
        }

    },


    /**
     * 按名字查詢一個
     * @param {*} ctx 
     */
    async findOneByName(ctx) {
        let body = ctx.request.body
        let name = body.data.name

        await coPlanModel.findOneByName(name)
            .then(r => {
                ctx.response.body = {
                    data: r
                }
            })
            .catch(err => {
                util.handleError(ctx, err)
            })

    },
    async findById(ctx) {
        let params = [],
            id = ctx.params.id
        params.push(id)
        await coPlanModel.findOneById(params)
            .then(r => {
                ctx.response.body = {
                    code: 0,
                    messaage: 'success',
                    data: r
                }
            })
            .catch(err => {
                util.handleError(ctx, err)
            })

    },

    /**
     * 插入一个
     * @param {*} ctx 
     * co_id text
     * plan_name text
     * advt_space_id Array
     */
    async insertOne(ctx) {
        try {
            // console.log(typeof ctx.request.body)
            let body = ctx.request.body.data
            console.log(body)
            let planId = null
            let isExist = await planModel.findOneByPlanName(body.plan_name, body.co_id)

            console.log('********', isExist)
            // 插入时查询是否存在
            if (isExist.length === 0) {
                // console
                console.log(body.co_id, '新方案')
                await planModel.insertOne(body)
                isExist = await planModel.findOneByPlanName(body.plan_name, body.co_id)
                planId = isExist[0].id
            } else {
                planId = isExist[0].id
            }
            let r = await coModel.findOneById(body.co_id)
            let co_name = r[0].name
            console.log(co_name)
            body.co_name = co_name
            console.log(body)
            for (let item of body.advt_space_id_list) {
                let r = await areaAdvtModel.findOneById(item.id)
                let advt = r[0]
                let planSectionExist = await planSectionModel.countByPlanIdAndSection(planId, advt.section);
                console.log('PLAN SECTION ===================\n', planSectionExist, planId, advt.section);
                if (parseInt(planSectionExist[0].count) === 0) {
                    await planSectionModel.insertOne(planId, advt.section);
                }


                let obj = {
                    plan_id: planId,
                    plan_name: body.plan_name,
                    co_id: body.co_id,
                    co_name: body.co_name,
                    advt_space_id: item.id,
                    section: advt.section,

                    area_id: advt.area_id,
                    area_name: advt.area_name,
                    area_location: advt.area_location,

                    advt_space_position: advt.advt_space_position,
                    advt_space_position_des: advt.advt_space_position_des,
                    isrented: advt.isrented
                }
                await coPlanModel.insertOne(obj)
            }
            ctx.response.body = {
                code: 0,
                message: 'success'
            }
        } catch (err) {
            util.handleError(ctx, err)
        }



    },
    /**
     * 删除一个
     * @param {*} ctx 
     */
    async deleteOnePlan(ctx) {
        let body = ctx.params
        console.log(body)
        let planId = body.planId;
        console.log(planId)
        await planModel.deleteByPlanId(planId)
        let planList = await coPlanModel.listByPlanId(planId)
        // 删除方案把 已出租的 还原
        for (let item of planList) {
            await areaAdvtModel.stopRent({ id: item.advt_space_id })
        }

        await coPlanModel.deleteByPlanId(planId)

        ctx.response.body = {
            code: 0,
            messaage: 'success'
        }

    },

    async deleteOnePlanAdvtSpace(ctx) {
        let body = ctx.params
        console.log(body)
        let id = body.id;
        console.log(id)
        await coPlanModel.deleteById(id)
        ctx.response.body = {
            code: 0,
            messaage: 'success'
        }
    },
    /**
     * 更新一个
     * @param {*} ctx 
     */
    async update(ctx) {
        let id = ctx.params.id,
            body = ctx.request.body.data
        body.id = id


        await coPlanModel.update(body)
            .then(r => {
                ctx.response.body = {
                    code: 0,
                    message: 'success'
                }
            })
            .catch(err => {
                util.handleError(ctx, err)

            })
    },

    async updatePlanName(ctx) {
        const body = ctx.request.body
        console.log(body)
        const r = planModel.updatePlanName(body)
        util.nResponse(ctx, 0, 'success', r)
    }

}

function getCoAdvtPlanDetialList(list, detailList) {
    return new Promise((resolve, reject) => {
        let idx = 0
        for (let i = 0; i < list.length; i++) {
            let item = list[i]
            areaAdvtModel.findOneById([item.advt_space_id])
                .then(r => {
                    idx++
                    console.log('detail>>', r)
                    let s = r[0]
                    detailList.push({
                        ...item,
                        area_name: s.area_name,
                        area_location: s.area_location,
                        advt_space_position: s.advt_space_position,
                        advt_space_position_des: s.advt_space_position_des,
                        section: s.section
                    })
                    // console.log(idx)
                    if (idx === list.length) {
                        resolve()
                    }
                })
        }
    })

}

module.exports = coAdvtPlanCtrl