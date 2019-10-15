/**
 * 广告位
 */
const PgPool = require("../pg/index");
const pgPool = new PgPool();
let query = (sql, params) => {
  return pgPool
    .query(sql, params)
    .then(r => {
      return r.rows;
    })
    .catch(err => {
      return Promise.reject(err);
    });
};
const areaAdvtModel = {
  params: "",
  conditionquery: "",
  listAll() {
    try {
      return query("select * from t_area_advt_space");
    } catch (err) {
      return Promise.reject(err);
    }
  },
  listCount(body) {
    try {
      console.log("in query listCount>>>", body);
      console.log(
        `select count(*) from t_area_advt_space ${areaAdvtModel.conditionquery}`
      );
      return query(
        `select count(*) from t_area_advt_space ${areaAdvtModel.conditionquery}`
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },
  list(body) {
    try {
      console.log("in query LIST>>>", body);
      listQueryString(body);

      console.log(
        `select * from t_area_advt_space ${areaAdvtModel.conditionquery} order by advt_space_position offset $1 limit $2`
      );
      return query(
        `select * from t_area_advt_space ${areaAdvtModel.conditionquery} order by advt_space_position offset $1 limit $2`,
        areaAdvtModel.params
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },

  listCountByAreaId(body) {
    try {
      let params = [];
      let fieldList = ["area_id"];
      fieldList.forEach(f => {
        params.push(body[f]);
      });
      // console.log(params)
      return query(
        `select count(*) from t_area_advt_space where area_id=$1;`,
        params
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },
  listByAreaId(body) {
    try {
      let params = [];
      let fieldList = ["offset", "limit", "area_id"];
      fieldList.forEach(f => {
        params.push(body[f]);
      });
      console.log(params);
      return query(
        "select * from t_area_advt_space where area_id=$3 offset $1 limit $2",
        params
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },

  listCountByIsRented(body) {
    try {
      let params = [];
      let fieldList = ["isRented"];
      fieldList.forEach(f => {
        params.push(body[f]);
      });
      // console.log(params)
      return query(
        `select count(*) from t_area_advt_space where isRented=$1;`,
        params
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },
  listByIsRented(body) {
    try {
      let params = [];
      let fieldList = ["offset", "limit", "isRented"];
      fieldList.forEach(f => {
        params.push(body[f]);
      });
      console.log(params);
      return query(
        `select * from t_area_advt_space where isRented=$3 offset $1 limit $2;`,
        params
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },

  /**
   * 未出租的广告位
   * @param {*} body
   */
  countNoRent() {
    try {
      // console.log(params)
      return query(
        "select count(*) from t_area_advt_space where isrented=0 OR isrented IS NULL;"
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },

  /**
   * 未出租的广告位
   * @param {*} body
   */
  countIsRent() {
    try {
      // console.log(params)
      return query("select count(*) from t_area_advt_space where isrented=1;");
    } catch (err) {
      return Promise.reject(err);
    }
  },

  findOneById(id) {
    try {
      let params = [id];
      return query(
        "SELECT * from t_area_advt_space where id=$1::uuid ",
        params
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },
  findOneByAdvtPosition(params) {
    try {
      return query(
        "SELECT * from t_area_advt_space where advt_space_position=$1 ",
        [params]
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },

  insertOne(body) {
    console.log('area advt model INSERT')
    try {
      let params = [];
      let fieldList = [
        "area_id",
        "area_name",
        "area_location",

        "advt_id",
        "light_size",

        "co_id",
        "co_name",

        "advt_space_position",

        "advt_space_position_des",

        "advt_position_image",

        "isRented",
        "section",
        "is_realestate",
        "is_exclusive"
      ];

      fieldList.forEach(f => {
        params.push(body[f]);
      });
      return query(
        `INSERT INTO t_area_advt_space(
                area_id,
                area_name,
                area_location,
                advt_id,
                light_size,
                co_id,
                co_name,
             
                advt_space_position,
                advt_space_position_des,
                advt_position_image,
                isRented,
                section,
                is_realestate,
                is_exclusive
            ) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14);`,
        params
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },
  delete(params) {
    try {
      return query("DELETE FROM t_area_advt_space where id=$1", params);
    } catch (err) {
      return Promise.reject(err);
    }
  },
  update(body) {
    console.log('area advt model UPDATE')
    try {
      let params = [];
      let fieldList = [
        "id",
        "area_id",
        "area_name",
        "area_location",
        "advt_id",
        "light_size",
        "co_id",
        "co_name",
        "expire_time",
        "advt_space_position",
        "advt_space_position_des",
        "advt_position_image",
        "isrented",
        "section"
      ];
      fieldList.forEach(f => {
        params.push(body[f]);
      });
      console.log("============================UPDATE ADVT SPACE>>\n", params);
      return query(
        `UPDATE t_area_advt_space
            SET   area_id=$2,
            area_name=$3,
            area_location=$4,
            advt_id=$5,
            light_size=$6,
            co_id=$7,
            co_name=$8,
            expire_time=$9,
            advt_space_position=$10,
            advt_space_position_des=$11,
            update_time=now(),
            advt_position_image=$12,
            isrented=$13,
            section=$14

            WHERE id=$1;`,
        params
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },
  stopRent(body) {
    try {
      let params = [];
      let fieldList = ["id"];
      fieldList.forEach(f => {
        params.push(body[f]);
      });
      console.log(params);
      return query(
        `UPDATE t_area_advt_space
            SET advt_id=null,
            advt_name=null,
            light_size=null,
            co_id=null,
            co_name=null,
            expire_time=null,          
            isRented=0
            WHERE id=$1;`,
        params
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },

  rentedList() {
    try {
      // console.log(params)
      return query("select * from t_area_advt_space where isrented=1;");
    } catch (err) {
      return Promise.reject(err);
    }
  },

  isRentedList(p) {
    try {
      // console.log(params)
      return query("select * from t_area_advt_space where isrented=$1;", [p]);
    } catch (err) {
      return Promise.reject(err);
    }
  },
  /**
   *  所有广告位
   * @param {1} p
   */
  AllList() {
    try {
      return query("select * from t_area_advt_space ;");
    } catch (err) {
      return Promise.reject(err);
    }
  },
  AllListBySectionName(section) {
    try {
      return query(
        "select * from t_area_advt_space where section=$1 order by area_name ASC;",
        [section]
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },
  /**
   * 按区域 未出租 查询列表
   * @param {*} p
   */
  listBySectionName(section, isRented) {
    try {
      return query(
        "select * from t_area_advt_space where section=$1 AND isrented=$2 order by area_name ASC;",
        [section, isRented]
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }
};

function listQueryString(body) {
  let params = [];
  let fieldList = ["offset", "limit"];
  let queryFList = [
    "area_id",
    "co_id",
    "section",
    "area_name",
    "area_location",
    "advt_space_position",
    "light_size",
    "isrented",
    "is_realestate",
    "is_exclusive"
  ];
  let conditionquery = ``;
  for (let i in body) {
    if (fieldList.indexOf(i) > -1) {
      params.push(body[i]);
    } else {
      if (body[i].length > 0 && queryFList.indexOf(i) > -1) {
        console.log("i.........................", i);
        if (conditionquery.length > 0) {
          conditionquery = conditionquery + ` and `;
        }

        let valueList = body[i];
        let fuzzyCondition =
          i === "area_location" ||
          i === "area_name" ||
          i === "advt_space_position";
        for (let j in valueList) {
          if (valueList.length === 1) {
            if (fuzzyCondition) {
              conditionquery =
                conditionquery + ` (${i} like '%${valueList[j]}%') `;
            } else {
              conditionquery = conditionquery + ` (${i}='${valueList[j]}') `;
            }
          } else {
            if (j > 0) {
              if (parseInt(j) === valueList.length - 1) {
                if (fuzzyCondition) {
                  conditionquery =
                    conditionquery + `OR ${i} like '%${valueList[j]}%')  `;
                } else {
                  conditionquery =
                    conditionquery + `OR ${i}='${valueList[j]}')  `;
                }
              } else {
                if (fuzzyCondition) {
                  conditionquery =
                    conditionquery + `OR ${i} like '%${valueList[j]}%' `;
                } else {
                  conditionquery =
                    conditionquery + `OR ${i}='${valueList[j]}' `;
                }
              }
            } else {
              // 1st
              if (fuzzyCondition) {
                conditionquery =
                  conditionquery + `(${i} like '%${valueList[j]}%' `;
              } else {
                conditionquery = conditionquery + `(${i}='${valueList[j]}' `;
              }
            }
          }
        }
      }
    }
  }
  console.log(params);
  console.log(conditionquery);
  if (conditionquery.length > 0) {
    conditionquery = ` where ${conditionquery} `;
  }
  areaAdvtModel.conditionquery = conditionquery;
  areaAdvtModel.params = params;
}
module.exports = areaAdvtModel;
