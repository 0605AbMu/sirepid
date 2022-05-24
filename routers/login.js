const { Router } = require("express");
const express = require("express");
const login = Router();
const admins = require("../controllers/admins");
const bcrypt = require("bcrypt");
const path = require("path");



console.log(path.join(__dirname, "..", "frontend", "login", "build"))

login.use("/", express.static(path.join(__dirname, "..", "frontend", "login", ""), {redirect:"/"}));



login.post("/addAdmin", async (req, res) => {
    let { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Login yoki Parol berilmadi!" });
    password = bcrypt.hashSync(password, bcrypt.genSaltSync(3));
    try {
        const admin = await admins.addAdmin({ name: name, email: email, password: password });
        if (admin !== null || admin != undefined) {
            req.session.isAdmin = true;
            res.status(200).json(admin);
        } else {
            res.status(500).json({ message: "Adminni qo'shib bo'lmadi" });
        }
    } catch (error) {
        res.status(501).json({ message: "Adminni qo'shib bo'lmadi" });
    }
})


login.post("/signIn", async (req, res) => {

    const { email, password } = req.body;
    const admin = await admins.getAdminByEmail(email);
    if (admin) {
        if (bcrypt.compareSync(password, admin.password)) {
            req.session.isAdmin = true;
            res.status(200).redirect("/posts/admin");
        } else {

            res.status(404).send(`
            <script>
            alert("Bu administrator topilmadi");
            window.location = "/login";
            </script>
            `)
        }

    } else {
        return res.status(404).send(`
        <script>
        alert("Bu administrator topilmadi");
        window.location = "/login";
        </script>
        `);
    }

})


login.get("/signOut", (req, res) => {
    if (req.session.isAdmin) {
        req.session.destroy(err => {
            if (err) {
                res.status(401).json({ message: "Chiqishda muammo yuzaga keldi" })
            }
        });
        res.status(200).json({ message: "Ko'rishguncha", redirect: "/login" })
    }
})



module.exports = login;