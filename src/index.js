require('dotenv').config()

const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const swaggerUi = require('swagger-ui-express')

const routes = require('./routes')
const swaggerFile = require('./swagger.json')

const app = express()

const PORT = process.env.PORT || 3000
const URL = process.env.URL || 'http://localhost'

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('common'))

const swaggerOptions = {
    swaggerOptions: {
        docExpansion: "none"
    }
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile, swaggerOptions))

app.get('/', (_, res) => {
    return res.status(200).json({
        success: true,
        message: 'Welcome to my API! 🚀'
    })
})

routes(app)

app.listen(PORT, () => {
    console.log(`Server running at ${URL}:${PORT} 🕹️`)
})