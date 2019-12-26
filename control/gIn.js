const util = require("../utils/index");
const path = require("path");
const send = require("koa-send");

const fs = require("fs");
const XLSX = require("xlsx-style");

const areaModel = require("../model/rdtlAreaModel");
const areaAdvtModel = require("../model/areaAdvtModel");
const areaAdvtCtrl = require("./areaAdvt");
const coAdvtPlanModel = require("../model/coAdvtPlanModel");
const planSectionModel = require("../model/planSectionModel");

const sectionStyle = {
  font: {
    sz: 10,
    bold: false,
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
};

const tableHeadStyle = {
  font: {
    sz: 10,
    bold: false,
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
};

const contentStyle = {
  font: {
    sz: 10,
    bold: false,
    color: { rgb: "000000" }
  },
  alignment: {
    vertical: "center",
    horizontal: "center",
    wrapText: true
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
};

const gIn = {
  async checkSchedule() {
    console.log("CHECK SCHEDULE");
    let rentedList = await areaAdvtModel.rentedList();
    // console.log('rented list>>', rentedList)
    for (let item of rentedList) {
      if (item.expire_time) {
        let exTime = new Date(item.expire_time).toLocaleString();
        util.setSchedule(exTime, () => {
          // DO the schedule task
          return areaAdvtCtrl.scheduleStopRent(item);
        });
      }
    }
  },
  async upload(ctx) {
    const file = ctx.request.files.file;

    const reader = fs.createReadStream(file.path);

    const stream = fs.createWriteStream(
      path.join(`/usr/local/nginx/html/images`, file.name)
    );
    reader.pipe(stream);
    console.log("uploading %s -> %s", file.name, stream.path);
    ctx.response.body = {
      code: 0,
      messaage: "success",
      data: {
        path: `http://106.12.40.54/images/${file.name}`
      }
    };
  },

  /**
   * 导入广告位
   * @param {*} ctx
   */

  // 序号	名称B	       分类C	地址D	                  户数E	车位数F	日均流量G	 灯箱位置H              I编号	  J规格	  K数量	 L楼盘
  // 1	朗晴假日一期		住宅	中山市东区岐关西路55号	900	  500	    800	      槎桥路西门地下停车场出入口	A0049	3m×1.5m	   2	  是

  async uploadExcel(ctx) {
    try {
      const file = ctx.request.files.file;
      console.log(file.name);

      var workbook = XLSX.readFile(file.path);
      // console.group("%c", "WORKBOOD");
      // console.log(workbook);
      // console.groupEnd();
      let sheetNames = workbook.SheetNames;
      for (let name of sheetNames) {
        console.log('sheet name>>', name)
        let r = workbook.Sheets[name];
        // console.log('sheet>>>\n', r)
        for (let i in r) {
          // console.log(i) // B area_name
          // G 楼盘？ H advt_position_des I advt_position J light_size
          let column = i.substr(0, 1);
          let row = i.substring(1, i.length);
          if (column === "B" && row > 1) {
            let areaName = name
            // 查询小区
            let areaR = await areaModel.countByName(areaName);
            // let area = areaR[0].count;
            let area = null
            if (areaR[0].count > 0) {
              let result = await areaModel.findOneByName(areaName)
              area = result[0]
            } else {
              // 没有小区 -> 新增小区
              let newArea = {
                section: r[`C${row}`].v,
                serial: null,
                name: r[`B${row}`].v,
                position: r[`E${row}`].v,
                lnglat: null,
                category: util.categoryToNum(r[`D${row}`].v),
                live_size: r[`F${row}`] === undefined ? 0 : r[`F${row}`].v,
                parking_num: Number(r[`G${row}`].v),
                location: r[`E${row}`].v,
                avg_daily_traffic: Number(r[`H${row}`].v),
                // 楼盘 === 是 ? is_exclusive ===false ?
                is_exclusive: util.excluToBool(r[`M${row}`].v),
              }
              let insertedArea = await areaModel.insertOne(newArea)
              area = insertedArea[0]
            }
            console.log(area)
            // console.log('light_size', r)
            let lightSize = r[`K${row}`].v;
            let xIdx = lightSize.indexOf("×");
            let lightWidth = lightSize.substring(0, xIdx - 1);
            let lightHeight = lightSize.substring(
              xIdx + 1,
              lightSize.length - 1
            );
            let areaSpacePos = r[`J${row}`].v;
            let areaSpacePosDes = r[`I${row}`].v;
            let is_realestate = false;
            if (r[`M${row}`].v === "是") {
              is_realestate = true;
            }

            let body = {
              area_id: area.id,
              area_name: area.name,
              section: area.section,
              area_location: area.location,

              light_size: [lightWidth, lightHeight],
              advt_space_position: areaSpacePos,
              advt_space_position_des: areaSpacePosDes,
              isrented: 0,
              is_realestate: is_realestate,
              // TODO
              advt_position_image: "",
              is_exclusive: util.excluToBool(r[`M${row}`].v)
            };
            // 插入一条前 先判断advt_position是否存在
            let areaAdvt = await areaAdvtModel.findOneByAdvtPosition(
              areaSpacePos
            );
            if (areaAdvt.length > 0) {
              body.id = areaAdvt[0].id;
              await areaAdvtModel.update(body);
            } else {
              await areaAdvtModel.insertOne(body);
            }
          }
        }
      }
      ctx.response.body = {
        code: 0,
        messaage: "success",
        data: {
          path: `http://106.12.40.54/excel/${file.name}`
        }
      };
    } catch (err) {
      console.error(err);
      util.handleError(ctx, err);
    }
  },

  async exportExcel(ctx) {
    let body = ctx.params;
    console.log(body);
    let result = [];
    let plan = await coAdvtPlanModel.listByPlanId(body.plan_id);
    console.log('导出的plan>>', plan);
    let coName = plan[0].co_name;
    let planName = plan[0].plan_name;

    let sectionList = await planSectionModel.listByPlanId(body.plan_id);
    console.log('计划中的section list', sectionList)

    for (let i = 0; i < sectionList.length; i++) {
      let item = sectionList[i];
      let o = {
        section: item.section,
        sectionSpaceTotal: 0,
        summary: [],
        list: []
      };
      let ResidentialList = [];
      let OfficeBuildingList = [];
      let HotelList = [];
      let BusinessCenterList = [];
      let CommerceCenterList = [];

      let residentialNum = 0;
      let officeBuildNum = 0;
      let hotelNum = 0;
      let businessCenterNum = 0;
      let commerCenterNum = 0;
      // // [{
      //     category:1,
      //     total:2
      // }],

      // 该区域下 方案的广告位个数
      let sectionAdvtSpaceList = await coAdvtPlanModel.listBySectionNameAndPlanId(
        item.section,
        body.plan_id
      );
      o.sectionSpaceTotal = sectionAdvtSpaceList.length;

      // 广告位id 列表
      for (let j = 0; j < sectionAdvtSpaceList.length; j++) {
        let spaceInfo = {};
        let item = sectionAdvtSpaceList[j];
        let area = await areaModel.findOneById([item.area_id]);
        let advtSpace = await areaAdvtModel.findOneById(item.advt_space_id);
        spaceInfo.category = area[0].category;
        spaceInfo.area_name = item.area_name;
        spaceInfo.location = area[0].location;
        spaceInfo.live_size = area[0].live_size;
        spaceInfo.parking_num = area[0].parking_num;
        spaceInfo.avg_daily_traffic = area[0].avg_daily_traffic;
        spaceInfo.space_position_des = item.advt_space_position_des;
        spaceInfo.advt_space_position = item.advt_space_position;
        let size = "";
        for (let i in advtSpace[0].light_size) {
          size = size + `${advtSpace[0].light_size[i]}m×`;
        }
        spaceInfo.light_size = size.substring(0, size.length - 1);

        o.list.push(spaceInfo);

        if (spaceInfo.category === 0) {
          if (ResidentialList.indexOf(spaceInfo.area_name) === -1) {
            ResidentialList.push(spaceInfo.area_name);
          }
          residentialNum += 1;
        }
        if (spaceInfo.category === 1) {
          if (CommerceCenterList.indexOf(spaceInfo.area_name) === -1) {
            CommerceCenterList.push(spaceInfo.area_name);
          }
          commerCenterNum += 1;
        }
        if (spaceInfo.category === 2) {
          if (OfficeBuildingList.indexOf(spaceInfo.area_name) === -1) {
            OfficeBuildingList.push(spaceInfo.area_name);
          }
          officeBuildNum += 1;
        }
        if (spaceInfo.category === 3) {
          if (HotelList.indexOf(spaceInfo.area_name) === -1) {
            HotelList.push(spaceInfo.area_name);
          }
          hotelNum += 1;
        }
        if (spaceInfo.category === 4) {
          if (BusinessCenterList.indexOf(spaceInfo.area_name) === -1) {
            BusinessCenterList.push(spaceInfo.area_name);
          }
          businessCenterNum += 1;
        }
      }

      o.summary.push({
        category: 0,
        total: ResidentialList.length,
        spaceTotal: residentialNum
      });
      o.summary.push({
        category: 2,
        total: OfficeBuildingList.length,
        spaceTotal: officeBuildNum
      });
      o.summary.push({
        category: 3,
        total: HotelList.length,
        spaceTotal: hotelNum
      });
      o.summary.push({
        category: 4,
        total: BusinessCenterList.length,
        spaceTotal: businessCenterNum
      });
      o.summary.push({
        category: 1,
        total: CommerceCenterList.length,
        spaceTotal: commerCenterNum
      });

      result.push(o);
    }
    // 导入excel 的 result

    console.log("===========导入excel 的 result==============\n", result);

    let merges = [];
    for (let i = 0; i < result.length; i++) {
      if (i === 0) {
        merges.push({
          s: {
            c: 0,
            r: 0
          },
          e: {
            c: 10,
            r: 0
          }
        });
      } else {
        merges.push({
          s: {
            c: 0,
            r: getMergeStart(i, result)
          },
          e: {
            c: 10,
            r: getMergeStart(i, result)
          }
        });
      }
    }
    console.log("merges=========\n", merges);

    let workbook = {
      SheetNames: ["mySheet"],
      Sheets: {
        mySheet: {
          "!ref": `A1:K${plan.length + result.length * 2}`, // 必须要有这个范围才能输出，否则导出的 excel 会是一个空表
          "!merges": merges
          // BGCOLOR 00FFC000
          // A1: {
          //     v: 'id', s: this.sectionStyle
          // },
        }
      }
    };

    let tableHead = [
      "序号",
      "名称",
      "分类",
      "地点",
      "户数",
      "车位数",
      "日均流量",
      "灯箱位置",
      "编号",
      "规格",
      "数量"
    ];
    let indexx = 0;
    for (let i = 0; i < merges.length; i++) {
      let item = merges[i];
      // rowA  表头
      let rowA = item.s.r + 1;
      let summaryString = "";
      if (result[i]) {
        for (let item of result[i].summary) {
          if (item.total > 0) {
            if (summaryString !== "") {
              summaryString =
                summaryString +
                `、${item.total} ${util.formatCategory(item.category)} ${
                item.spaceTotal
                } 灯箱`;
            } else {
              summaryString =
                summaryString +
                `${item.total} ${util.formatCategory(item.category)} ${
                item.spaceTotal
                } 灯箱`;
            }
          }
        }
        summaryString.substring(0, 2);
        workbook.Sheets.mySheet[`A${rowA}`] = {
          v: `${result[i].section} ${result[i].list.length}个灯箱 (${summaryString})`,
          s: sectionStyle
        };

        // 写入表头
        for (let j = 0, keyCode = 65; j < tableHead.length; j++ , keyCode++) {
          let head = tableHead[j];
          let letter = String.fromCharCode(keyCode);
          workbook.Sheets.mySheet[`${letter}${rowA + 1}`] = {
            v: head,
            s: tableHeadStyle
          };
        }

        // 写入内容
        let tempIndex = 1;
        let tempDif = 1;
        for (let k = 0; k < result[i].list.length; k++) {
          indexx++;
          let item = result[i].list[k];
          for (let keyCode = 65; keyCode < 76; keyCode++) {
            let letter = String.fromCharCode(keyCode);

            switch (letter) {
              case "A":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: indexx,
                  s: contentStyle,
                  t: "n"
                };
                break;
              case "B":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: item.area_name,
                  s: contentStyle
                };
                break;
              case "C":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: util.formatCategory(item.category),
                  s: contentStyle
                };
                break;
              case "D":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: item.location,
                  s: contentStyle
                };
                break;
              case "E":
                if (
                  isNaN(item.live_size) ||
                  item.live_size === undefined ||
                  item.live_size === null
                ) {
                  workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                    v: "-",
                    s: contentStyle
                  };
                  break;
                } else {
                  workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                    v: parseInt(item.live_size),
                    s: contentStyle,
                    t: "n"
                  };
                  break;
                }

              case "F":
                if (
                  isNaN(item.parking_num) ||
                  item.parking_num === undefined ||
                  item.parking_num === null
                ) {
                  workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                    v: "-",
                    s: contentStyle
                  };
                  break;
                } else {
                  workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                    v: parseInt(item.parking_num),
                    s: contentStyle,
                    t: "n"
                  };
                  break;
                }

              case "G":
                if (
                  isNaN(item.avg_daily_traffic) ||
                  item.avg_daily_traffic === undefined ||
                  item.avg_daily_traffic === null
                ) {
                  workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                    v: "-",
                    s: contentStyle
                  };
                  break;
                } else {
                  workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                    v: item.avg_daily_traffic,
                    s: contentStyle,
                    t: "n"
                  };
                  break;
                }

              case "H":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: item.space_position_des,
                  s: contentStyle
                };
                break;
              case "I":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: item.advt_space_position,
                  s: contentStyle
                };
                break;
              case "J":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: item.light_size,
                  s: contentStyle
                };
                break;
              case "K":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  // TODO
                  v: result[i].list.length,
                  s: contentStyle,
                  t: "n"
                };
                break;
              default:
                break;
            }
          }
          // console.log(item.area_name, tempIndex, tempDif)
          // merge
          if (k > 0 && item.area_name !== result[i].list[k - 1].area_name) {
            tempDif = k + 1;

            // console.log('***************************', item.area_name, tempIndex, tempDif);
            let startRow = rowA + tempIndex;
            let endRow = rowA + tempDif - 1;
            console.log(
              item.area_name,
              tempIndex,
              tempDif,
              " in  s.r>>>",
              startRow + 1,
              "e.r>>>",
              endRow + 1
            );

            for (let i = 1; i <= 6; i++) {
              merges.push({
                s: {
                  c: i,
                  r: startRow
                },
                e: {
                  c: i,
                  r: endRow
                }
              });
            }
            merges.push({
              s: {
                c: 10,
                r: startRow
              },
              e: {
                c: 10,
                r: endRow
              }
            });

            workbook.Sheets.mySheet[`K${rowA + tempIndex + 1}`] = {
              v: tempDif - tempIndex,
              s: contentStyle,
              t: "n"
            };

            if (result[i].list.length === tempDif) {
              workbook.Sheets.mySheet[`K${rowA + tempDif + 1}`] = {
                v: 1,
                s: contentStyle,
                t: "n"
              };
            }

            tempIndex = tempDif;
          } else if (k === result[i].list.length - 1 && tempDif === 1) {
            let startRow = rowA + tempIndex;
            let endRow = startRow + result[i].list.length - 1;
            console.log(
              item.area_name,
              " tempDif === 1 s.r>",
              startRow + 1,
              "e.r>>>",
              endRow + 1
            );

            for (let m = 1; m <= 6; m++) {
              merges.push({
                s: {
                  c: m,
                  r: startRow
                },
                e: {
                  c: m,
                  r: endRow
                }
              });
            }
            merges.push({
              s: {
                c: 10,
                r: startRow
              },
              e: {
                c: 10,
                r: endRow
              }
            });
            workbook.Sheets.mySheet[`K${rowA + result[i].list.length + 1}`] = {
              v: result[i].list.length,
              s: contentStyle,
              t: "n"
            };
          } else if (k === result[i].list.length - 1 && tempDif !== 1) {
            let startRow = rowA + tempDif;
            let endRow = rowA + result[i].list.length;
            console.log(
              item.area_name,
              tempIndex,
              tempDif,
              "tempDif  !== 1 s.r>>",
              startRow + 1,
              "e.r>>>",
              endRow + 1
            );

            for (let m = 1; m <= 6; m++) {
              merges.push({
                s: {
                  c: m,
                  r: startRow
                },
                e: {
                  c: m,
                  r: endRow
                }
              });
            }
            merges.push({
              s: {
                c: 10,
                r: startRow
              },
              e: {
                c: 10,
                r: endRow
              }
            });

            workbook.Sheets.mySheet[`K${rowA + tempIndex + 1}`] = {
              v: result[i].list.length - tempIndex + 1,
              s: contentStyle,
              t: "n"
            };
          }
        }
      }
    }

    // merges.push({
    //     s: {
    //         c: 2,
    //         r: 2
    //     },
    //     e: {
    //         c: 2,
    //         r: 3
    //     }
    // })

    // { font: { sz: 14, bold: true, color: { rgb: "FFFFAA00" } }, fill: { bgColor: { indexed: 64 }, fgColor: { rgb: "FFFF00" } } ,border: { top: { style: 'medium', color: { rgb: "FFFFAA00"}}, left: { style: 'medium', color: { rgb: "FFFFAA00"}}}};
    workbook.Sheets.mySheet["!rows"] = [
      {
        hpt: "16"
      }
    ];
    let fileName = encodeURI(
      `${coName}-${planName}-${util.formatFIleTime(new Date().getTime())}.xlsx`
    );
    let file = XLSX.writeFile(workbook, fileName);

    ctx.body = fs.readFileSync(fileName);
    ctx.response.set("Content-Disposition", "attachment;filename=" + fileName);
  },

  /**
   * all  is or not rented
   * @param {*} ctx
   */
  async exportRentedSpaceExcel(ctx) {
    let isRented = ctx.params.isrented;
    console.log("isRented", isRented);
    let result = [];
    // console.log(plan);
    let total = null;
    if (isRented < 2) {
      total = await areaAdvtModel.isRentedList(isRented);
    } else {
      total = await areaAdvtModel.AllList();
    }

    let sectionList = util.sectionList;
    for (let i = 0; i < sectionList.length; i++) {
      let item = sectionList[i];
      let o = {
        section: item,
        sectionSpaceTotal: 0,
        summary: [],
        list: []
      };
      let ResidentialList = [];
      let OfficeBuildingList = [];
      let HotelList = [];
      let BusinessCenterList = [];
      let CommerceCenterList = [];

      let residentialNum = 0;
      let officeBuildNum = 0;
      let hotelNum = 0;
      let businessCenterNum = 0;
      let commerCenterNum = 0;
      // // [{
      //     category:1,
      //     total:2
      // }],

      // 该区域下 方案的广告位个数
      let sectionAdvtSpaceList = [];
      if (isRented < 2) {
        sectionAdvtSpaceList = await areaAdvtModel.listBySectionName(
          item,
          isRented
        );
      } else {
        sectionAdvtSpaceList = await areaAdvtModel.AllListBySectionName(item);
      }

      o.sectionSpaceTotal = sectionAdvtSpaceList.length;

      // 广告位id 列表
      for (let j = 0; j < sectionAdvtSpaceList.length; j++) {
        let spaceInfo = {};
        let item = sectionAdvtSpaceList[j];
        let area = await areaModel.findOneById([item.area_id]);
        // let advtSpace = await areaAdvtModel.findOneById(item.advt_space_id);
        spaceInfo.category = area[0].category;
        spaceInfo.area_name = item.area_name;
        spaceInfo.location = area[0].location;
        spaceInfo.live_size = area[0].live_size;
        spaceInfo.parking_num = area[0].parking_num;
        spaceInfo.avg_daily_traffic = area[0].avg_daily_traffic;
        spaceInfo.space_position_des = item.advt_space_position_des;
        spaceInfo.advt_space_position = item.advt_space_position;
        let size = "";
        if (item.light_size) {
          for (let i in item.light_size) {
            size = size + `${item.light_size[i]}m×`;
          }
        }

        spaceInfo.light_size = size.substring(0, size.length - 1);

        o.list.push(spaceInfo);

        if (spaceInfo.category === 0) {
          if (ResidentialList.indexOf(spaceInfo.area_name) === -1) {
            ResidentialList.push(spaceInfo.area_name);
          }
          residentialNum += 1;
        }
        if (spaceInfo.category === 1) {
          if (CommerceCenterList.indexOf(spaceInfo.area_name) === -1) {
            CommerceCenterList.push(spaceInfo.area_name);
          }
          commerCenterNum += 1;
        }
        if (spaceInfo.category === 2) {
          if (OfficeBuildingList.indexOf(spaceInfo.area_name) === -1) {
            OfficeBuildingList.push(spaceInfo.area_name);
          }
          officeBuildNum += 1;
        }
        if (spaceInfo.category === 3) {
          if (HotelList.indexOf(spaceInfo.area_name) === -1) {
            HotelList.push(spaceInfo.area_name);
          }
          hotelNum += 1;
        }
        if (spaceInfo.category === 4) {
          if (BusinessCenterList.indexOf(spaceInfo.area_name) === -1) {
            BusinessCenterList.push(spaceInfo.area_name);
          }
          businessCenterNum += 1;
        }
      }

      o.summary.push({
        category: 0,
        total: ResidentialList.length,
        spaceTotal: residentialNum
      });
      o.summary.push({
        category: 2,
        total: OfficeBuildingList.length,
        spaceTotal: officeBuildNum
      });
      o.summary.push({
        category: 3,
        total: HotelList.length,
        spaceTotal: hotelNum
      });
      o.summary.push({
        category: 4,
        total: BusinessCenterList.length,
        spaceTotal: businessCenterNum
      });
      o.summary.push({
        category: 1,
        total: CommerceCenterList.length,
        spaceTotal: commerCenterNum
      });
      if (o.list.length > 0) {
        result.push(o);
      }
    }
    // 导入excel 的 result

    console.log("=========================\n", result);

    let merges = [];
    for (let i = 0; i < result.length; i++) {
      console.log("merge    i       ", i);
      if (i === 0) {
        merges.push({
          s: {
            c: 0,
            r: 0
          },
          e: {
            c: 10,
            r: 0
          }
        });
      } else {
        merges.push({
          s: {
            c: 0,
            r: getMergeStart(i, result)
          },
          e: {
            c: 10,
            r: getMergeStart(i, result)
          }
        });
      }
    }
    console.log("merges=========\n", merges);

    let workbook = {
      SheetNames: ["mySheet"],
      Sheets: {
        mySheet: {
          "!ref": `A1:K${total.length + result.length * 2}`, // 必须要有这个范围才能输出，否则导出的 excel 会是一个空表
          "!merges": merges
          // BGCOLOR 00FFC000
          // A1: {
          //     v: 'id', s: this.sectionStyle
          // },
        }
      }
    };

    let tableHead = [
      "序号",
      "名称",
      "分类",
      "地点",
      "户数",
      "车位数",
      "日均流量",
      "灯箱位置",
      "编号",
      "规格",
      "数量"
    ];
    let indexx = 0;
    for (let i = 0; i < merges.length; i++) {
      let item = merges[i];
      // rowA  表头
      let rowA = item.s.r + 1;
      let summaryString = "";
      if (result[i]) {
        for (let item of result[i].summary) {
          if (item.total > 0) {
            if (summaryString !== "") {
              summaryString =
                summaryString +
                `、${item.total} ${util.formatCategory(item.category)} ${
                item.spaceTotal
                } 灯箱`;
            } else {
              summaryString =
                summaryString +
                `${item.total} ${util.formatCategory(item.category)} ${
                item.spaceTotal
                } 灯箱`;
            }
          }
        }
        summaryString.substring(0, 2);

        workbook.Sheets.mySheet[`A${rowA}`] = {
          v: `${result[i].section} ${result[i].list.length}个灯箱 (${summaryString})`,
          s: sectionStyle
        };

        // 写入表头
        for (let j = 0, keyCode = 65; j < tableHead.length; j++ , keyCode++) {
          let head = tableHead[j];
          let letter = String.fromCharCode(keyCode);
          workbook.Sheets.mySheet[`${letter}${rowA + 1}`] = {
            v: head,
            s: tableHeadStyle
          };
        }

        // 写入内容
        let tempIndex = 1;
        let tempDif = 1;
        for (let k = 0; k < result[i].list.length; k++) {
          indexx++;
          let item = result[i].list[k];
          for (let keyCode = 65; keyCode < 76; keyCode++) {
            let letter = String.fromCharCode(keyCode);

            switch (letter) {
              case "A":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: indexx,
                  s: contentStyle,
                  t: "n"
                };
                break;
              case "B":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: item.area_name,
                  s: contentStyle
                };
                break;
              case "C":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: util.formatCategory(item.category),
                  s: contentStyle
                };
                break;
              case "D":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: item.location,
                  s: contentStyle
                };
                break;
              case "E":
                if (
                  isNaN(item.live_size) ||
                  item.live_size === undefined ||
                  item.live_size === null
                ) {
                  workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                    v: "-",
                    s: contentStyle
                  };
                  break;
                } else {
                  workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                    v: parseInt(item.live_size),
                    s: contentStyle,
                    t: "n"
                  };
                  break;
                }

              case "F":
                if (
                  isNaN(item.parking_num) ||
                  item.parking_num === undefined ||
                  item.parking_num === null
                ) {
                  workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                    v: "-",
                    s: contentStyle
                  };
                  break;
                } else {
                  workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                    v: parseInt(item.parking_num),
                    s: contentStyle,
                    t: "n"
                  };
                  break;
                }

              case "G":
                if (
                  isNaN(item.avg_daily_traffic) ||
                  item.avg_daily_traffic === undefined ||
                  item.avg_daily_traffic === null
                ) {
                  workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                    v: "-",
                    s: contentStyle
                  };
                  break;
                } else {
                  workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                    v: item.avg_daily_traffic,
                    s: contentStyle,
                    t: "n"
                  };
                  break;
                }

              case "H":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: item.space_position_des,
                  s: contentStyle
                };
                break;
              case "I":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: item.advt_space_position,
                  s: contentStyle
                };
                break;
              case "J":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  v: item.light_size,
                  s: contentStyle
                };
                break;
              case "K":
                workbook.Sheets.mySheet[`${letter}${rowA + 2 + k}`] = {
                  // TODO
                  v: result[i].list.length,
                  s: contentStyle,
                  t: "n"
                };
                break;
              default:
                break;
            }
          }
          // console.log(item.area_name, tempIndex, tempDif)
          // merge
          if (k > 0 && item.area_name !== result[i].list[k - 1].area_name) {
            tempDif = k + 1;

            // console.log('***************************', item.area_name, tempIndex, tempDif);
            let startRow = rowA + tempIndex;
            let endRow = rowA + tempDif - 1;
            console.log(
              item.area_name,
              tempIndex,
              tempDif,
              " in  s.r>>>",
              startRow + 1,
              "e.r>>>",
              endRow + 1
            );

            for (let i = 1; i <= 6; i++) {
              merges.push({
                s: {
                  c: i,
                  r: startRow
                },
                e: {
                  c: i,
                  r: endRow
                }
              });
            }
            merges.push({
              s: {
                c: 10,
                r: startRow
              },
              e: {
                c: 10,
                r: endRow
              }
            });

            workbook.Sheets.mySheet[`K${rowA + tempIndex + 1}`] = {
              v: tempDif - tempIndex,
              s: contentStyle,
              t: "n"
            };

            if (result[i].list.length === tempDif) {
              workbook.Sheets.mySheet[`K${rowA + tempDif + 1}`] = {
                v: 1,
                s: contentStyle,
                t: "n"
              };
            }

            tempIndex = tempDif;
          } else if (k === result[i].list.length - 1 && tempDif === 1) {
            let startRow = rowA + tempIndex;
            let endRow = startRow + result[i].list.length - 1;
            console.log(
              item.area_name,
              " tempDif === 1 s.r>",
              startRow + 1,
              "e.r>>>",
              endRow + 1
            );

            for (let m = 1; m <= 6; m++) {
              merges.push({
                s: {
                  c: m,
                  r: startRow
                },
                e: {
                  c: m,
                  r: endRow
                }
              });
            }
            merges.push({
              s: {
                c: 10,
                r: startRow
              },
              e: {
                c: 10,
                r: endRow
              }
            });
            workbook.Sheets.mySheet[`K${rowA + result[i].list.length + 1}`] = {
              v: result[i].list.length,
              s: contentStyle,
              t: "n"
            };
          } else if (k === result[i].list.length - 1 && tempDif !== 1) {
            let startRow = rowA + tempDif;
            let endRow = rowA + result[i].list.length;
            console.log(
              item.area_name,
              tempIndex,
              tempDif,
              "tempDif  !== 1 s.r>>",
              startRow + 1,
              "e.r>>>",
              endRow + 1
            );

            for (let m = 1; m <= 6; m++) {
              merges.push({
                s: {
                  c: m,
                  r: startRow
                },
                e: {
                  c: m,
                  r: endRow
                }
              });
            }
            merges.push({
              s: {
                c: 10,
                r: startRow
              },
              e: {
                c: 10,
                r: endRow
              }
            });

            workbook.Sheets.mySheet[`K${rowA + tempIndex + 1}`] = {
              v: result[i].list.length - tempIndex + 1,
              s: contentStyle,
              t: "n"
            };
          }
        }
      }
    }

    // merges.push({
    //     s: {
    //         c: 2,
    //         r: 2
    //     },
    //     e: {
    //         c: 2,
    //         r: 3
    //     }
    // })

    // { font: { sz: 14, bold: true, color: { rgb: "FFFFAA00" } }, fill: { bgColor: { indexed: 64 }, fgColor: { rgb: "FFFF00" } } ,border: { top: { style: 'medium', color: { rgb: "FFFFAA00"}}, left: { style: 'medium', color: { rgb: "FFFFAA00"}}}};
    workbook.Sheets.mySheet["!rows"] = [
      {
        hpt: "16"
      }
    ];
    let fileName = encodeURI(`广告位.xlsx`);
    let file = XLSX.writeFile(workbook, fileName);

    ctx.body = fs.readFileSync(fileName);
    ctx.set("Access-Control-Expose-Headers", "Content-Disposition");
    ctx.response.set("Content-Disposition", "attachment;filename=" + fileName);
  }
};

function getMergeStart(i, list) {
  if (i === 0) {
    return list[0].sectionSpaceTotal + 2;
  } else if (i === 1) {
    return list[0].sectionSpaceTotal + 2;
  } else {
    return getMergeStart(i - 1, list) + list[i - 1].sectionSpaceTotal + 2;
  }
}

module.exports = gIn;
