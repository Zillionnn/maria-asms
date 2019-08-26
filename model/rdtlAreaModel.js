const PgPool = require("../pg/index");
const pgPool = new PgPool();
let query = (sql, params) => {
  return pgPool
    .query(sql, params)
    .then(r => {
      return r.rows;
    })
    .catch(err => {
      // console.error('rdtlarea Model', err)
      return Promise.reject(err);
    });
};
const rdtlAreaModel = {
  listAll() {
    try {
      return query("select * from t_residential_area;");
    } catch (err) {
      return Promise.reject(err);
    }
  },
  listCount() {
    try {
      return query(`select count(*) from t_residential_area`);
    } catch (err) {
      return Promise.reject(err);
    }
  },
  list(params) {
    try {
      return query(
        `select * from t_residential_area offset $1 limit $2;`,
        params
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },
  findOneByName(name) {
    try {
      console.log(name);
      return query("SELECT * from t_residential_area where name=$1::text ;", [
        name
      ]);
    } catch (err) {
      return Promise.reject(err);
    }
  },
  /**
   * 查询小区名字数量 查重
   * @param {*} name 
   */
  countByName(name) {
    try {
      return query(`SELECT count(*) from t_residential_area where name=$1;`, [name])
    } catch (err) {
      return Promise.reject(err)
    }
  },
  findOneById(params) {
    try {
      return query(
        "SELECT * from t_residential_area where id=$1::uuid ;",
        params
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },
  insertOne(body) {
    try {
      let params = [],
        fieldList = [
          "section",
          "serial",
          "name",
          "position",
          "lnglat",
          "category",
          "live_size",
          "parking_num",
          "location",
          "avg_daily_traffic",
          "is_exclusive",
        ];
      fieldList.forEach(k => {
        params.push(body[k]);
      });
      console.log(params);

      return query(
        `INSERT INTO public.t_residential_area(
             section, serial, name, "position", lnglat, category, live_size, parking_num, location, avg_daily_traffic,is_exclusive)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
        params
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },
  delete(params) {
    try {
      return query("DELETE FROM t_residential_area where id=$1", params).then(
        r => {
          console.warn("AREA DELETE | ");
          query(`DELETE FROM t_area_advt_space WHERE area_id=$1`, params);
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },
  update(body) {
    try {
      let params = [],
        fieldList = [
          "id",
          "section",
          "serial",
          "name",
          "position",
          "lnglat",
          "category",
          "live_size",
          "parking_num",
          "location",
          "avg_daily_traffic",
          "is_exclusive"
        ];
      fieldList.forEach(k => {
        params.push(body[k]);
      });

      return query(
        `UPDATE public.t_residential_area
        SET section=$2, serial=$3, name=$4, "position"=$5, lnglat=$6, category=$7, live_size=$8, parking_num=$9, location=$10, avg_daily_traffic=$11,is_exclusive=$12, update_time=now() 
        WHERE id=$1;`,
        params
      ).then(r => {
        console.warn("AREA UPDATE | ", [
          body.name,
          body.id,
          body.location,
          body.section,
          body.is_realestate
        ]);
        query(
          `UPDATE t_area_advt_space SET area_name=$1, area_location=$3, section=$4, is_exclusive=$5 WHERE area_id=$2`,
          [body.name, body.id, body.location, body.section, body.is_realestate]
        );
      });
    } catch (err) {
      return Promise.reject(err);
    }
  },

  countAreaCategory() {
    try {
      return query("select count(*) FROM t_residential_area where ", params).then(
        r => {
          console.warn("AREA DELETE | ");
          query(`DELETE FROM t_area_advt_space WHERE area_id=$1`, params);
        }
      );
    } catch (err) {
      return Promise.reject(err);
    }
  },
  /**
   * 通过区域查小区
   * @param {*} body 
   */
  listBySection(body) {
    try {
      let params = [],
        fieldList = [
          "section"
        ];
      fieldList.forEach(k => {
        params.push(body[k]);
      });
      return query(`select * from t_residential_area where section = $1`, params)
    } catch (err) {
      return Promise.reject(err);
    }
  }
};

module.exports = rdtlAreaModel;
