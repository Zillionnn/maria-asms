const schedule = require('node-schedule')

const util = {
    handleError(ctx, err) {
        let e = new Error(err)
        console.error('HANDLE ERROR>>', e)
        ctx.status = 400

        if (e.message.indexOf('duplicate key') > -1) {
            ctx.response.body = {
                code: 5001,
                message: `已存在`
            }
        } else {
            ctx.response.body = {
                code: 5000,
                message: e.message
            }
        }



    },

    setSchedule(date, fn) {
        console.log('do schedule', date)
        let j = schedule.scheduleJob(date, fn)
        // j.cancel();
    }
}

module.exports = util