const { Router, json } = require("express");
const post = Router();
const posts = require("../controllers/posts");
const fs = require("fs");
const path = require("path");
const express = require("express");
const { ObjectId } = require("mongodb");
const postScheme = require("../schema/postSchema");
const multer = require("multer")({
    dest: "files/", limits: { fileSize: 10 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype != "image/jpeg") {
            cb(new Error("Fayl rasm emas"))
        } else return cb(null, true)
    }
});

post.use((req, res, next)=>{
    if(req.method == "GET" && req.baseUrl!="/posts") return next();
    if (req.session.isAdmin==true){
         next();
    } else {
        res.redirect("/login");
    }
})

post.use("/admin", express.static(path.join(__dirname, "..", "frontend", "admin", "")));


post.get("/", async (req, res) => {
    try {
        const result = await posts.getAll();
        res.status(200).json(result);

    } catch (error) {
        res.status(501).json({ message: "Serverda xatolik mavjud!" });
    }

})


post.post("/add", multer.single("postImage"), async (req, res) => {
if (req.session.isAdmin!=true){
return res.status(410).json({message:"siz admin emassiz!"});
}
    try {
        if (req.file == undefined) return res.status(400).json({ message: "Post rasmi berilmadi" })
    } catch (error) {
        res.status(400).json({ message: error });
    }


    if (req.body == undefined || Object.keys(req.body).length == 0) return res.status(400).json({ message: "Ma'lumotlar berilmadi" });
    const result = postScheme.addPostSchema.validate(req.body)
    if (result.error) {
        return res.status(400).json({ message: result.error.message });
    };

    try {



        const added = await posts.addOne(req.body, req.file.path);

        if (added.insertedId) {
            req.body._id = added.insertedId;
            return res.status(200).json(req.body);
        } else {
            return res.status(501).json({ message: "DataBase ishlashida xatolik mavjud" });

        }

    } catch (error) {
        res.status(501).json({ message: "DataBase ishlashida xatolik mavjud" });
    }

});

post.put("/update", multer.single("postImage"), async (req, res) => {
    if (req.body == undefined || Object.keys(req.body).length == 0) return res.status(400).json({ message: "Ma'lumotlar berilmadi" });
    const { _id, ...updatableData } = req.body;
    if (_id == undefined) res.status(400).json({ message: "ID raqam berilmadi!" });
    const result = postScheme.updatePostSchema.validate(updatableData)
    if (result.error) {
        return res.status(400).json({ message: result.error.message });
    };

    try {

        const updated = await posts.updateById(_id, updatableData, (req.file ? req.file.path : null), res);
        if (!updated) return;
        if (updated.matchedCount != 0) {
            return res.status(200).json(await posts.getById(_id));
        } else {
            return res.status(400).json({ message: "BU ID ga ega post topilmadi!" })
        }
    } catch (error) {
        return res.status(501).json({ message: "DataBase ishlashida xatolik mavjud" });
    }

});


post.delete("/delete", (req, res) => {
    if (!req.body._id) res.status(400).json({ messagge: "Post ID si berilmadi" });
    if (!ObjectId.isValid(req.body._id)) res.status(400).json({ messagge: "Notog'ri ID raqam berildi" });
    posts.deleteById(req.body._id, res);
})


post.get("/getImage/:Id", async (req, res) => {
    if (!req.params.Id) return res.status(400).json({ message: "Rasm ID si berilmadi!" });
    posts.downloadPostImageById(req, res);
})

post.get("/getPost/:Id", async (req, res) => {

    if (!req.params.Id) { return res.status(400).json({ message: "Post IDsi berilmadi" }) };

    try {
        let pt = await posts.getById(req.params.Id);
        if (pt && pt._id) {
            return res.status(200).json(pt);
        } else {
            return res.status(404).json({ message: "Bu ID ga ega Post topilmadi" });
        }
    } catch (error) {
        return res.status(501).json({ message: "Nimadur Xato ketdi. Balki ID raqam noto'g'ri!" + error })
    }





})

module.exports = post;