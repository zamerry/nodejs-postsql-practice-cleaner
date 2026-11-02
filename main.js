import express from 'express'
import dotenv from 'dotenv'
import router from "./router.js";
import cors from 'cors'

dotenv.config()

const port = process.env.port || 5000

const app = express()
app.use(express.json())

app.use(cors())

app.use('/psql', router)

app.listen(port, () => {
    console.log("сервер работает")
})