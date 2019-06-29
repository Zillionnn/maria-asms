const advtModel = require('../model/advtModel')
const util = require('../utils/index')

function generateParams(p, b) {
    for (let i in b) {
        p.push(b[i])
    }
    return p
}
const advt = {
    /**
     * 列表
     * @param {*} ctx 
     */
    async list(ctx) {
        let params = []
        let body = ctx.request.query
        for (let i in body) {
            params.push(body[i])
        }
        let data = await advtModel.list(params)
        let total = await advtModel.listCount()
        ctx.response.body = {
            code: 2000,
            messaage: 'success',
            total: total[0].count,
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

        await advtModel.findOneByName(name)
            .then(r => {
                ctx.response.body = {
                    code: 2000,
                    messaage: 'success',
                    data: r
                }
            })
            .catch(err => {
                util.handleError(ctx, err)

            })

    },
    async findById(ctx) {
        let params = [], id = ctx.params.id
        params.push(id)
        await advtModel.findOneById(params)
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
     */
    async insertOne(ctx) {
        let body = ctx.request.body.data
        await advtModel.insertOne(body)
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
     * 删除一个
     * @param {*} ctx 
     */
    async delete(ctx) {
        let params = [], id = ctx.params.id
        params.push(id)
        console.log(params)
        await advtModel.delete(params)
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
        let id = ctx.params.id, body = ctx.request.body.data
        body.id = id

        await advtModel.update(body)
            .then(r => {
                ctx.response.body = {
                    code: 0,
                    message: 'success',
                    data: r
                }
            })
            .catch(err => {
                util.handleError(ctx, err)

            })
    }

}

module.exports = advt