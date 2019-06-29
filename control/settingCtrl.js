const settingModel = require('../model/settingModel')
const util = require('../utils/index')

function generateParams(p, b) {
    for (let i in b) {
        p.push(b[i])
    }
    return p
}
const co = {
    /**
     * 列表
     * @param {*} ctx 
     */
    async list(ctx) {
        try {
            let data = await settingModel.listAll()
            ctx.response.body = {
                code: 2000,
                messaage: 'success',               
                data: data
            }
        } catch (err) {
            util.handleError(ctx, err)
        }
    },
    
    /**
     * 插入一个
     * @param {*} ctx 
     */
    async insertOne(ctx) {
        // console.log(typeof ctx.request.body)
        let body = ctx.request.body.data
        console.log(body)

        await settingModel.insertOne(body)
            .then(r => {
                ctx.response.body = {
                    code: 0,
                    messaage: 'success'
                }
            })
            .catch(err => {
                util.handleError(ctx, err)
            })

    },
    /**
     * 删除一个
     * @param {*} ctx 
     */
    async delete(ctx) {
        let params = [],
            id = ctx.params.id
        params.push(id)
        console.log(params)
        await settingModel.delete(params)
            .then(r => {
                ctx.response.body = {
                    data: r
                }
            })
            .catch(err => {
                util.handleError(ctx, err)

            })

    },
    /**
     * 更新一个
     * @param {*} ctx 
     */
    async update(ctx) {
        let id = ctx.params.id,
            body = ctx.request.body.data
        body.id = id


        await settingModel.update(body)
            .then(r => {
                ctx.response.body = {
                    code: 0,
                    message: 'success'
                }
            })
            .catch(err => {
                util.handleError(ctx, err)

            })
    }

}

module.exports = co