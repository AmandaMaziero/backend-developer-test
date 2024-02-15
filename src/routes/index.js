const company = require("./company.routes")
const job = require("./job.routes")
const feed = require("./feed.routes")

module.exports = app => {
    app.use(
        company,
        feed,
        job
    )
}