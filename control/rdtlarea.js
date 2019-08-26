const rdtlAreaModel = require('../model/rdtlAreaModel')
const util = require('../utils/index')
const os = require('os');
const path = require('path');
const fs = require('fs')

function generateParams(p, b) {
    for (let i in b) {
        p.push(b[i])
    }
    return p
}
const rdtlArea = {
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
        let data = await rdtlAreaModel.list(params)
        let total = await rdtlAreaModel.listCount()
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

        await rdtlAreaModel.findOneByName(name)
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
        let params = [], id = ctx.params.id
        params.push(id)
        await rdtlAreaModel.findOneById(params)
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
        let name = body.name.replace(/\s/g, '')

        let r = await rdtlAreaModel.findOneByName(name)
        if (r.length > 0) {
            util.handleError(ctx, '小区名称重复')
        } else {
            await rdtlAreaModel.insertOne(body)
                .then(r => {
                    ctx.response.body = {
                        code: 0,
                        messaage: 'success'
                    }
                })
                .catch(err => {
                    util.handleError(ctx, err)
                })
        }


    },
    /**
     * 删除一个
     * @param {*} ctx 
     */
    async delete(ctx) {
        let params = [], id = ctx.params.id
        params.push(id)
        console.log(params)
        await rdtlAreaModel.delete(params)
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

        await rdtlAreaModel.update(body)
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
    },

    async upload(ctx) {
        const file = ctx.request.files.file;

        const reader = fs.createReadStream(file.path);

        // TOD png jpg
        let name = Math.random() + '.png'
        const stream = fs.createWriteStream(path.join(`/var/www/html/images`, name));
        reader.pipe(stream);
        console.log('uploading %s -> %s', file.name, stream.path);
        ctx.response.body = {
            code: 0,
            messaage: 'success',
            data: {
                path: `http://106.12.40.54/images/${name}`
            }
        }

    }

}

module.exports = rdtlArea