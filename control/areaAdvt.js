const areaAdvtModel = require('../model/areaAdvtModel')
const coModel = require('../model/coModel')
const advtModel = require('../model/advtModel')
const areaModel = require('../model/rdtlAreaModel')
const settingModel = require('../model/settingModel')
const util = require('../utils/index')
const nodemailer = require("nodemailer");

function generateParams(p, b) {
    for (let i in b) {
        p.push(b[i])
    }
    return p
}
const areaAdvt = {
    /**
     * 列表
     * @param {*} ctx 
     * body[x]  为数组
     */
    async list(ctx) {
        let query = ctx.request.query
        let body = ctx.request.body.data
        body.offset = query.offset
        body.limit = query.limit
        // body.isRented = parseInt(body.isRented)
        console.log(body)
        return areaAdvtList(ctx, body)
    },

    /**
    * 按小区id查询列表
    * @param {*} ctx 
    */
    async listByAreaId(ctx) {
        let body = ctx.request.query
        console.log(body)
        let data = await areaAdvtModel.listByAreaId(body)
        let total = await areaAdvtModel.listCountByAreaId(body)
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

        await areaAdvtModel.findOneByName(name)
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
        await areaAdvtModel.findOneById(params)
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
        console.log(body)
        let areaId = body.area_id,
            co_id = body.co_id,
            advt_id = body.advt_id
        let advtList = await advtModel.findOneById([advt_id])
        let advt = advtList[0]
        let coList = await coModel.findOneById(co_id)
        let co = coList[0]
        let areaList = await areaModel.findOneById([areaId])
        let area = areaList[0]

        console.log('advt>>', advt)
        console.log('co>>', co)
        console.log('area>> ', area)
        body.area_name = area.name
        body.area_location = area.location
        body.section = area.section
        body.is_realestate = area.is_realestate

        body.co_name = co.name

        body.light_size = advt.size
        // 小区 or 广告？
        body.lease_time = advt.lease_time
        console.log(body)
        await areaAdvtModel.insertOne(body)
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
    async insertOneAdvtSpace(ctx) {
        let body = ctx.request.body.data
        console.log(body)
        let areaId = body.area_id
        let areaList = await areaModel.findOneById([areaId])
        let area = areaList[0]
        console.log('area>> ', area)
        body.area_name = area.name
        body.area_location = area.location
        body.section = area.section
        body.is_realestate = area.is_realestate

        // 初始未 出租
        body.isRented = 0
        console.log(body)
        await areaAdvtModel.insertOne(body)
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
        await areaAdvtModel.delete(params)
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
        let areaId = body.area_id,
            co_id = body.co_id,
            advt_id = body.advt_id
        let advtList = await advtModel.findOneById([advt_id])
        let advt = advtList[0]
        let coList = await coModel.findOneById(co_id)
        let co = coList[0]
        console.log(co)
        let areaList = await areaModel.findOneById([areaId])
        let area = areaList[0]

        console.log('advt>>', advt)
        console.log('co>>', co)
        console.log('area>> ', area)
        body.area_name = area.name
        body.area_location = area.location
        body.section = area.section
        if (co) {
            body.co_name = co.name
            body.isRented = 1
        } else {
            body.isRented = 0
        }
        if (advt) {
            body.advt_name = advt.name
            // body.light_size = advt.size
            // 小区 or 广告？
            body.lease_time = advt.lease_time
        }

        let expireTime = body.expire_time
        await areaAdvtModel.update(body)
            .then(r => {
                ctx.response.body = {
                    code: 0,
                    message: 'success',
                    data: r
                }
                return body
            })
            .then(r => {
                console.log(r)
                // if has expire time DO THE SCHEDULE 
                if (expireTime) {
                    util.setSchedule(expireTime, () => {
                        return areaAdvt.scheduleStopRent(r)
                    })
                }
            })
            .catch(err => {
                util.handleError(ctx, err)

            })
    },

    /**
     * 广告位列表更新出租信息
     */
    async updateSpace(ctx) {
        let spaceList = ctx.request.body.data.data
        let expTime = ctx.request.body.data.expire_time
        console.log(spaceList)
        for (let item of spaceList) {
            let paramBody = {}
            console.log(item.advt_space_id)
            let advtList = await areaAdvtModel.findOneById(item.advt_space_id)
            let advt = advtList[0]
            let coList = await coModel.findOneById(item.co_id)
            let co = coList[0]
            // let areaList = await areaModel.findOneById([areaId])
            // let area = areaList[0]

            // console.log('advt>>', advt)
            // console.log('co>>', co)
            paramBody = Object.assign(paramBody,advt)
            // console.log('area>> ', area)
            paramBody.area_name = item.area_name
            paramBody.area_location = item.area_location
            paramBody.section = item.section
            paramBody.co_id = co.id
            paramBody.co_name = co.name
            paramBody.isRented = 1
            paramBody.expire_time = expTime

            if (advt) {
                paramBody.advt_name = advt.name
                // body.light_size = advt.size
                // 小区 or 广告？
                paramBody.lease_time = advt.lease_time
            }

            // let expireTime = body.expire_time
            await areaAdvtModel.update(paramBody)
                .then(r => {
                    ctx.response.body = {
                        code: 0,
                        message: 'success',
                        data: r
                    }
                    return paramBody
                })
                .then(r => {
                    // console.log(r)
                    // if has expire time DO THE SCHEDULE 
                    // TODO
                    // if (expireTime) {
                    //     util.setSchedule(expireTime, () => {
                    //         return areaAdvt.scheduleStopRent(r)
                    //     })
                    // }
                })
                .catch(err => {
                    util.handleError(ctx, err) 
                })


        }
    },

    /**
     * 停止出租
     * @param {*} ctx 
     */
    async stopRent(ctx) {
        let body = {
            id: ctx.params.id
        }

        await areaAdvtModel.stopRent(body)
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
    /**
     * 统计为出租的数量
     * @param {*} ctx 
     */
    async countNoRentCtrl(ctx) {
        await areaAdvtModel.countNoRent()
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

    async scheduleStopRent(body) {
        console.log('START STOP RENT>>', body.id)
        let expTime = body.expire_time
        areaAdvtModel.stopRent(body)
            .then(r => {
                sendEmail(body, expTime)
                console.log('有广告位到期', new Date(), body)
            })
            .catch(err => {
                // util.handleError(ctx, err)
                console.error(err)
            })
    }

}

async function areaAdvtList(ctx, params) {
    console.log('no condition')
    let data = await areaAdvtModel.list(params)
    let total = await areaAdvtModel.listCount(params)
    ctx.response.body = {
        code: 2000,
        messaage: 'success',
        total: total[0].count,
        data: data
    }
}


// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(body, expTime) {
    try {
        console.log('SEND EMAIL FOR TIP')
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();
        let config = await settingModel.listAll()
        console.log(config[0])
        let toWho = config[0].email

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.163.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'skyestzhang@163.com', // generated ethereal user
                pass: '4501122z' // generated ethereal password            
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '<skyestzhang@163.com>', // sender address
            to: toWho, // list of receivers
            subject: "==🚀广告位到期提醒==", // Subject line
            text: ``, // plain text body
            html: `${body.co_name} 有广告位到期;<br/>
                ${body.section} ${body.area_name} <br/>
                ${body.advt_space_position} ${body.advt_space_position_des} <br/>
                到期时间${new Date(expTime).toLocaleString()}` // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    } catch (err) {
        console.error(err)
        // return sendEmail(body, expTime)
    }


}
// sendEmail().catch(console.error);

module.exports = areaAdvt