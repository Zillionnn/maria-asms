const coModel = require('../model/coModel')
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
            let params = []
            let body = ctx.request.query
            for (let i in body) {
                params.push(body[i])
            }
            // console.log(a)
            let data = await coModel.list(params)
            let total = await coModel.listCount()
            ctx.response.body = {
                code: 2000,
                messaage: 'success',
                total: total[0].count,
                data: data
            }
        } catch (err) {
            util.handleError(ctx, err)
        }
    },
    /**
     * 按名字查詢一個
     * @param {*} ctx 
     */
    async findOneByName(ctx) {
        let body = ctx.request.body
        let name = body.data.name

        await coModel.findOneByName(name)
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
        await coModel.findOneById(id)
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
        // console.log(typeof ctx.request.body)
        let body = ctx.request.body.data
        console.log(body)

        await coModel.insertOne(body)
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
        await coModel.delete(params)
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


        await coModel.update(body)
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