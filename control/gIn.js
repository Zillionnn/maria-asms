const util = require('../utils/index')
const path = require('path');
const send = require('koa-send');

const fs = require('fs')
const XLSX = require('xlsx-style')

const areaModel = require('../model/rdtlAreaModel')
const areaAdvtModel = require('../model/areaAdvtModel')
const areaAdvtCtrl = require('./areaAdvt')
const coAdvtPlanModel = require('../model/coAdvtPlanModel')
const planSectionModel = require('../model/planSectionModel')

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
        let sectionStyle = {
            font: {
                sz: 10, bold: false,
                color: { rgb: "000000" }
            },
            fill: {
                fgColor: { rgb: "FFC000" }
            },
            border: {
                top: {
                    style: "thin",
                    color: {
                        rgb: "00000000"
                    }
                },
                left: {
                    style: "thin",
                    color: {
                        rgb: "000000"
                    }
                },
                right: {
                    style: "thin",
                    color: {
                        rgb: "000000"
                    }
                },
                bottom: {
                    style: "thin",
                    color: {
                        rgb: "000000"
                    }
                }
            }
        }

        let tableHeadStyle = {
            font: {
                sz: 10, bold: false,
                color: { rgb: "000000" }
            },
            fill: {
                fgColor: { rgb: "FFF1CE" }
            },
            border: {
                top: {
                    style: "thin",
                    color: {
                        rgb: "00000000"
                    }
                },
                left: {
                    style: "thin",
                    color: {
                        rgb: "000000"
                    }
                },
                right: {
                    style: "thin",
                    color: {
                        rgb: "000000"
                    }
                },
                bottom: {
                    style: "thin",
                    color: {
                        rgb: "000000"
                    }
                }
            }
        }

        let body = ctx.params
        console.log(body);
        let result = []
        let plan = await coAdvtPlanModel.listByPlanId(body.plan_id);
        console.log(plan);

        let sectionList = await planSectionModel.listByPlanId(body.plan_id);
        for (let i = 0; i < sectionList.length; i++) {
            let item = sectionList[i];
            let o = {
                section: item.section,
                sectionSpaceTotal: 0,
                list: []
            }

            // 该区域下 方案的广告位个数
            let sectionAdvtSpaceList = await coAdvtPlanModel.listBySectionNameAndPlanId(item.section, body.plan_id);
            o.sectionSpaceTotal = sectionAdvtSpaceList.length;

            // 广告位id 列表
            for (let j = 0; j < sectionAdvtSpaceList.length; j++) {
                let spaceInfo = {}
                let item = sectionAdvtSpaceList[j]
                let area = await areaModel.findOneByName(item.area_name);
                spaceInfo.category = area[0].category;
                spaceInfo.area_name = item.area_name;
                spaceInfo.location = area[0].location;
                spaceInfo.live_size = area[0].live_size;
                spaceInfo.parking_num = area[0].parking_num;
                spaceInfo.space_position_des = item.advt_space_position_des;
                o.list.push(spaceInfo)
            }
            result.push(o);


        }
        // 导入excel 的 result
        console.log('=========================\n', result);
        let merges = [];
        for (let i = 0; i < result.length; i++) {
            if (i === 0) {
                merges.push({
                    "s": {
                        "c": 0,
                        "r": 0
                    },
                    "e": {
                        "c": 10,
                        "r": 0
                    }
                });
            } else {
                merges.push({
                    "s": {
                        "c": 0,
                        "r": getMergeStart(i, result)
                    },
                    "e": {
                        "c": 10,
                        "r": getMergeStart(i, result)
                    }
                });
            }




        }
        console.log('merges=========\n', merges);

        let workbook = {
            SheetNames: ['mySheet'],
            Sheets: {
                'mySheet': {
                    '!ref': `A1:K${plan.length + result.length * 2}`, // 必须要有这个范围才能输出，否则导出的 excel 会是一个空表
                    "!merges": merges,

                    // BGCOLOR 00FFC000
                    // A1: {
                    //     v: 'id', s: this.sectionStyle
                    // },


                }
            }
        }
        let tableHead = ['序号', '名称', '分类', '地点', '户数', '车位数', '日均流量', '灯箱位置', '编号', '规格', '数量']
        for (let i = 0; i < merges.length; i++) {
            let item = merges[i];
            let rowA = item.s.r + 1;
            workbook.Sheets.mySheet[`A${rowA}`] = {
                v: result[i].section,
                s: sectionStyle
            }
            for (let j = 0, keyCode = 65; j < tableHead.length; j++ , keyCode++) {
                let head = tableHead[j];
                let letter = String.fromCharCode(keyCode)
                workbook.Sheets.mySheet[`${letter}${rowA + 1}`] = {
                    v: head,
                    s: tableHeadStyle
                }
            }

        }

        // { font: { sz: 14, bold: true, color: { rgb: "FFFFAA00" } }, fill: { bgColor: { indexed: 64 }, fgColor: { rgb: "FFFF00" } } ,border: { top: { style: 'medium', color: { rgb: "FFFFAA00"}}, left: { style: 'medium', color: { rgb: "FFFFAA00"}}}};

        let fileName = `sss.xlsx`
        let file = XLSX.writeFile(workbook, fileName);

        ctx.body = fs.readFileSync(fileName);
        ctx.response.set("Content-Disposition", "attachment;filename=" + fileName);
    }

}

function getMergeStart(i, list) {
    if (i === 0) {
        return list[0].sectionSpaceTotal + 2;
    } else if (i === 1) {
        return list[0].sectionSpaceTotal + 2;
    } else {
        let b = getMergeStart(i - 2, list)
        return b + list[i - 1].sectionSpaceTotal + 2;
    }
}

module.exports = gIn