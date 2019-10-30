const schedule = require("node-schedule");

const util = {
  handleError(ctx, err) {
    let e = new Error(err);
    console.error(
      "######################" +
      new Date().toLocaleString() +
      "#######################"
    );
    console.error("HANDLE ERROR>>", e);
    ctx.status = 400;

    if (e.message.indexOf("duplicate key") > -1) {
      ctx.response.body = {
        code: 5001,
        message: `已存在`
      };
    } else {
      ctx.response.body = {
        code: 5000,
        message: e.message
      };
    }
  },

  nResponse(ctx, code = 0, message = '', data = null) {
    ctx.response.body = {
      code: code,
      message: message,
      data: data
    }
  },

  setSchedule(date, fn) {
    console.log("do schedule", date);
    let j = schedule.scheduleJob(date, fn);
    // j.cancel();
  },


  formatCategory(n) {
    switch (n) {
      case 0:
        return "住宅";
      case 1:
        return "商业中心";
      case 2:
        return "写字楼";
      case 3:
        return "酒店";
      case 4:
        return "商务中心";
    }
  },


  categoryToNum(n) {
    switch (n) {
      case "住宅":
        return 0;
      case "商业中心":
        return 1;
      case "写字楼":
        return 2;
      case "酒店":
        return 3;
      case "商务中心":
        return 4;
    }
  },

  excluToBool(n) {
    switch (n) {
      case "是":
        return false;
      case "否":
        return true;
    }
  },

  formatFIleTime(ts) {
    let t = new Date(ts);
    let y = t.getFullYear();
    let mon = t.getMonth() + 1;
    if (mon < 10) {
      mon = `0${mon}`
    }
    let date = t.getDate();
    if (date < 10) {
      date = `0${date}`
    }
    let h = t.getHours();
    if (h < 10) {
      h = `0${h}`
    }
    let m = t.getMinutes();
    if (m < 10) {
      m = `0${m}`
    }
    let s = t.getSeconds();
    if (s < 10) {
      s = `0${s}`
    }
    return `${y}${mon}${date}${h}${m}${s}`
  },

  sectionList: [
    "西区",
    "东区",
    "石岐区",
    "南区",
    "火炬区",
    "沙溪镇",
    "东升镇",
    "东凤镇",
    "横栏镇",
    "南朗镇",
    "南头镇",
    "三角镇",
    "坦洲镇",
    "民众镇",
    "板芙镇"
  ]
};

module.exports = util;
