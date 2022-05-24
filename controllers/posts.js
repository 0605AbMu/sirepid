const { MongoClient, ObjectId, GridFSBucket, } = require("mongodb");
const fs = require("fs");
const client = new MongoClient("mongodb+srv://sirses:159357Dax@cluster0.ypeq0.mongodb.net/?retryWrites=true&w=majority");

client.connect()
    .then(res => {
        console.log("Postlar bazasi ulandi...");
    })
    .catch(e => {
        console.log("Postlar bazasi ulanmadi.\nError: ", e);
        throw new Error(e);
    });

const posts = client.db("test").collection("posts");


async function addOne(data, path) {
    const imgId = uploadPostImage(path);
    data.imageId = imgId;
    const dt = (await posts.insertOne(data))
    return dt;
};

async function getAll() {
    return (await posts.find().toArray());
}

async function updateById(id, data, filePath, res) {

    const oldPost = await getById(id);
    data.imageId = oldPost.imageId || null;



    if (filePath != null) {

        const imageId = await updatePostImageById(data, filePath, res);
        if (!imageId) { return res.status(501).json({ message: "Yangilab bo'lmadi" }) };
    }
    return await posts.updateOne({ _id: new ObjectId(id) }, { $set: data });
};

/**
 *  
 * @param {import("express").Response} res 
 * @returns 
 */
async function deleteById(id, res) {
    const oldPost = await getById(id);
    if (!oldPost) {
        return res.status(404).json({ message: "Bu ID ga ega post topilmadi" });
    }
    if (oldPost.imageId) {

        await deletePostImage(oldPost.imageId);
    }
    try {
        if (await (await posts.deleteOne({ _id: new ObjectId(id) })).deletedCount != 0) {
            res.status(200).json(oldPost)
        } else {
            res.status(501).json({ message: "Postni o'chirib bo'lmadi" });
        }

    } catch (error) {
        
        res.status(501).json({ message: "Postni o'chirib bo'lmadi" + error });
    }
    return null;
};

async function getById(_id) {
    return await posts.findOne({ _id: new ObjectId(_id) });
}




const postImages = client.db("test");
const postImagesBucket = new GridFSBucket(postImages, { bucketName: "postImages" });




function uploadPostImage(path) {
    const img = postImagesBucket.openUploadStream("this post image")
    fs.createReadStream(path).pipe(img);
    img.on("finish", () => {
        fs.unlinkSync(path);
    })
    return img.id
}


/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @returns 
 */

async function downloadPostImageById(req, res) {
    try {
        const { _id } = (await postImagesBucket.find({ _id: new ObjectId(req.params.Id) }).toArray())[0] || [];
        if (_id) {
            return postImagesBucket.openDownloadStream(_id).pipe(res);
        } else {
            res.status(404).json("Bu ID ga ega rasm topilmadi!");
        }

    } catch (error) {
        return res.status(501).json({ message: "Xato ketdi! " + error });
    }


}

/**
 * 
 * @param {*} data 
 * @param {*} filePath 
 * @param {import("express").Response} res 
 */

async function updatePostImageById(data, filePath, res) {
    try {

        const oldImage = await (await postImagesBucket.find({ _id: data.imageId }).toArray()).at(0);
        
        if (oldImage) {
            await postImagesBucket.delete(oldImage._id);
        };
        fs.createReadStream(filePath).pipe(postImagesBucket.openUploadStreamWithId(data.imageId, data.caption).on("error", (err) => {  }))
            .on("finish", () => {
                fs.unlinkSync(filePath);
            });
        return data.imageId;
    } catch (error) {
        res.status(501).json({ message: "Error " + error })
        return undefined;
    }
}


async function deletePostImage(imageId) {
    if ((await postImagesBucket.find({ _id: imageId }).count()) != 0) {
        await postImagesBucket.delete(imageId)
        return true;
    }
    else {
        return false
    }
}



// async function gett(__id){
//     return await (await postImagesBucket.find().toArray()).find(({_id})=>{return _id == __id});
// }






module.exports = {
    addOne: addOne,
    getAll: getAll,
    updateById: updateById,
    deleteById: deleteById,
    getById: getById,
    downloadPostImageById: downloadPostImageById,
    updatePostImageById: updatePostImageById
}