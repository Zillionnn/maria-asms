const util = require('../utils/index')
const path = require('path');
const send = require('koa-send');

const fs = require('fs')
const XLSX = require('xlsx')
const areaModel = require('../model/rdtlAreaModel')
const areaAdvtModel = require('../model/areaAdvtModel')
const areaAdvtCtrl = require('./areaAdvt')
const gIn = {

    async checkSchedule() {
        console.log('CHECK SCHEDULE')
        let rentedList = await areaAdvtModel.rentedList()
        // console.log('rented list>>', rentedList)
        for (let item of rentedList) {
            if (item.expire_time) {
                let exTime = new Date(item.expire_time).toLocaleString()
                util.setSchedule(exTime, () => {
                    // DO the schedule task
                    return areaAdvtCtrl.scheduleStopRent(item)
                })
            }
        }


    },
    async upload(ctx) {
        const file = ctx.request.files.file;

        const reader = fs.createReadStream(file.path);

        const stream = fs.createWriteStream(path.join(`/var/www/html/images`, file.name));
        reader.pipe(stream);
        console.log('uploading %s -> %s', file.name, stream.path);
        ctx.response.body = {
            code: 0,
            messaage: 'success',
            data: {
                path: `http://106.12.40.54/images/${file.name}`
            }
        }
    },

    /**
     * 导入广告位
     * @param {*} ctx 
     */
    async uploadExcel(ctx) {
        try {
            const file = ctx.request.files.file;
            console.log(file.name)

            var workbook = XLSX.readFile(file.path);
            console.group('%c', 'WORKBOOD');
            console.log(workbook);
            console.groupEnd();
            let sheetNames = workbook.SheetNames
            for (let name of sheetNames) {
                let r = workbook.Sheets[name]
                // console.log('sheet>>>\n', r)
                for (let i in r) {
                    // console.log(i) // B area_name
                    // G 楼盘？ H advt_position_des I advt_position J light_size
                    let column = i.substr(0, 1)
                    let row = i.substring(1, i.length)
                    // console.log(column, row)
                    if (column === 'B' && row > 1) {
                        let areaR = await areaModel.findOneByName(r[i].v)
                        let area = areaR[0]
                        // console.log(area)
                        // console.log('light_size', r)
                        let lightSize = r[`J${row}`].v
                        let xIdx = lightSize.indexOf('×')
                        let lightWidth = lightSize.substring(0, xIdx - 1)
                        let lightHeight = lightSize.substring(xIdx + 1, lightSize.length - 1)
                        let areaSpacePos = r[`I${row}`].v
                        let areaSpacePosDes = r[`H${row}`].v

                        let body = {
                            area_id: area.id,
                            area_name: area.name,
                            section: area.section,
                            area_location: area.location,

                            light_size: [lightWidth, lightHeight],
                            advt_space_position: areaSpacePos,
                            advt_space_position_des: areaSpacePosDes,
                            isRented: 0,
                            // TODO 
                            advt_position_image: ''

                        }
                        // 插入一条前 先判断advt_position是否存在
                        let areaAdvt = await areaAdvtModel.findOneByAdvtPosition(areaSpacePos)
                        if (areaAdvt.length > 0) {
                            body.id = areaAdvt[0].id
                            await areaAdvtModel.update(body)
                        } else {
                            await areaAdvtModel.insertOne(body)
                        }

                    }
                }
            }
            ctx.response.body = {
                code: 0,
                messaage: 'success',
                data: {
                    path: `http://106.12.40.54/excel/${file.name}`
                }
            }
        } catch (err) {
            console.error(err)
            util.handleError(ctx, err)
        }

    },

    async exportExcel(ctx) {
        let workbook = {
            SheetNames: ['mySheet'],
            Sheets: {
                'mySheet': {
                    '!ref': 'A1:E4', // 必须要有这个范围才能输出，否则导出的 excel 会是一个空表
                    A1: { v: 'id' },
                    C3: { v: '你麻痹' }
                }
            }
        }
        let fileName = `sss.xlsx`
        let file = XLSX.writeFile(workbook, fileName);

        // const path = `./out.xlsx`;
        // ctx.attachment(path);
        // await send(ctx, path);


        ctx.body = fs.readFileSync(fileName);
        ctx.response.set("Content-Disposition", "attachment;filename=" + fileName);
        //请求返回后，删除生成的xlsx文件，不删除也行，下次请求回覆盖



    }

}

module.exports = gIn