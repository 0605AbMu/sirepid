const express = require("express");
const app = express();
const cors = require("cors")
const posts = require("../controllers/posts");
const session = require("express-session");
const easySession = require("easy-session");
const cookieParser = require("cookie-parser")
const path = require("path")

const PORT = process.env.PORT || 10;
const HOST = process.env.HOST || "localhost";


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: "*",
    
}))


app.use(session({
    secret: "secretHash#@#1123^%",
    name: "ss",
    cookie: {
        maxAge: 2 * 60  * 60 * 1000,
        secure: false
    },
    resave: true,
    saveUninitialized: true
}))



app.use("/", express.static(path.join(__dirname, "..", "frontend", "client", ""), {index:"index.html"}))

app.use("/posts", require("../routers/post"));
app.use("/login", require("../routers/login"));


app.get("/getPosts", async (req, res) => {
    try {
        const result = await posts.getAll();
        res.status(200).json(result);
    } catch (error) {
        res.status(501).json({ message: "Serverda xatolik mavjud!" });
    }
})



app.listen(PORT, HOST, () => {
    console.log(`Server ishga tushdi: http://${HOST}:${PORT}/`)
})