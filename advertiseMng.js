const logger = require('koa-logger');
const Router = require('koa-router');
const koaBody = require('koa-body');
const cors = require('koa-cors');
const Koa = require('koa');
const app = module.exports = new Koa();

const rdtlarea = require('./control/rdtlarea')
const co = require('./control/co')
const advt = require('./control/advt')
const gIn = require('./control/gIn')
const areaAdvt = require('./control/areaAdvt')
const settingCtrl = require('./control/settingCtrl')
const coAdvtPlanCtrl = require('./control/coAdvtPlanCtrl.js')
// "database"

const posts = [];

// middleware
app.use(logger());
app.use(cors())

// app.use(render);

app.use(koaBody({ multipart: true }));

var router = new Router();

app.use(router.routes())

router.use(`/api/v1`, useAuth)

async function useAuth(ctx, next) {
  console.log('=================================   ', new Date().toLocaleString(), '===================================')
  console.log(`================================        ${ctx.url}             ==================================`)
  return next()
}

router.post(`/api/v1/uploadImg`, gIn.upload)
router.post(`/api/v1/uploadXls`, gIn.uploadExcel)
router.get(`/api/v1/exportXlsx/:plan_id`, gIn.exportExcel)
router.post(`/api/v1/exportIsNoRentedSpaceExcel/:isrented`, gIn.exportRentedSpaceExcel)

router.get('/api/v1/rdtlarea/list', rdtlarea.list)
router.post(`/api/v1/rdtlarea`, rdtlarea.findOneByName)
router.post(`/api/v1/rdtlarea/add`, rdtlarea.insertOne)
router.get(`/api/v1/rdtlarea/:id`, rdtlarea.findById)
router.delete(`/api/v1/rdtlarea/:id`, rdtlarea.delete)
router.put(`/api/v1/rdtlarea/:id`, rdtlarea.update)


router.get(`/api/v1/co/list`, co.list)
router.post(`/api/v1/co`, co.findOneByName)
router.post(`/api/v1/co/add`, co.insertOne)
router.get(`/api/v1/co/:id`, co.findById)
router.delete(`/api/v1/co/:id`, co.delete)
router.put(`/api/v1/co/:id`, co.update)

router.get(`/api/v1/advt/list`, advt.list)
router.post(`/api/v1/advt`, advt.findOneByName)
router.post(`/api/v1/advt/add`, advt.insertOne)
router.get(`/api/v1/advt/:id`, advt.findById)
router.delete(`/api/v1/advt/:id`, advt.delete)
router.put(`/api/v1/advt/:id`, advt.update)

router.post(`/api/v1/areaAdvt/list`, areaAdvt.list)
router.get(`/api/v1/areaAdvt/space/list`, areaAdvt.listByAreaId)
router.post(`/api/v1/areaAdvt`, areaAdvt.findOneByName)
router.post(`/api/v1/areaAdvt/add`, areaAdvt.insertOne)
router.post(`/api/v1/areaAdvt/advtSpace/add`, areaAdvt.insertOneAdvtSpace)
// router.put(`/api/v1/areaAdvt/advtSpace/:id`, areaAdvt.updateAreaAdvtSpace)
router.get(`/api/v1/areaAdvt/:id`, areaAdvt.findById)
router.delete(`/api/v1/areaAdvt/:id`, areaAdvt.delete)
router.put(`/api/v1/areaAdvt/:id`, areaAdvt.update)
router.put(`/api/v1/areaAdvt/stop-rent/:id`, areaAdvt.stopRent)
router.get(`/api/v1/areaAdvt/norent/count`, areaAdvt.countNoRentCtrl)
router.get(`/api/v1/areaAdvt/isrented/count`, areaAdvt.countIsRent)

// 广告位列表更新出租信息
router.put(`/api/v1/coplan/areaAdvt/release-space`, areaAdvt.updateSpace)

// setting
router.get(`/api/v1/setting`, settingCtrl.list)
router.put(`/api/v1/setting/:id`, settingCtrl.update)

// co advt plan
router.get(`/api/v1/coplan/list/:coId`, coAdvtPlanCtrl.listByCo)
router.post(`/api/v1/coplan/add`, coAdvtPlanCtrl.insertOne)
router.delete(`/api/v1/coplan/:planId`, coAdvtPlanCtrl.deleteOnePlan)
router.delete(`/api/v1/coplan/advtspace/:id`, coAdvtPlanCtrl.deleteOnePlanAdvtSpace)
router.post(`/api/v1/coplan/advtspace/add`, coAdvtPlanCtrl.addPlanSapce)
router.put(`/api/v1/co-plan/plan-name`, coAdvtPlanCtrl.updatePlanName)



gIn.checkSchedule()

if (!module.parent) app.listen(2999);