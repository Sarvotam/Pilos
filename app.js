import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'; // configure cors policy
import connectDB from './config/connectdb.js'
import userRoutes from './routes/userRoutes.js'


const app = express()
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

// cors policy
app.use(cors())

// database connection
connectDB(DATABASE_URL)

// json API
app.use(express.json())

// load routes
app.use("/api/user", userRoutes)

app.listen(port, () => {
    console.log(`server listening at http://localhost:${port}`)
})