

const { MongoClient, ObjectId} = require("mongodb");
const client = new MongoClient("mongodb+srv://sirses:159357Dax@cluster0.ypeq0.mongodb.net/?retryWrites=true&w=majority");

client.connect()
    .then(res => {
        console.log("Login bazasi ulandi...");
    })
    .catch(e => {
        console.log("Login bazasi ulanmadi.\nError: ", e);
        throw new Error(e);
    });

const admins = client.db("test").collection("admins");

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @returns 
 */

async function addAdmin(data, res){
try {
    const currentLoginId = (await admins.insertOne(data)).insertedId;
    data._id = currentLoginId;
    return data;
} catch (error) {
    throw new Error(error);
}
}
/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @returns 
 */

async function deleteAdminById(id, res) {
try {
    const count = await (await admins.deleteOne({_id: id})).deletedCount;
    if (count==0){
        res.status(404).json({message: "Bu administrator topilmadi!"});
    }

} catch (error) {
    res.status(501).json({message: "Administratorni o'chirib bo'lmadi!"});
    throw new Error(error);
}
}

async function getAdminByEmailAndPassword(data){
try {
    const admin = await admins.findOne({email: data.email, password: data.password})
    if (admin){
        return admin;
    } else {
        return null;
    }
    
} catch (error) {
    throw new Error(error);
}
}

async function getAdminByEmail(email){
    try {
        const admin = await admins.findOne({email: email})
        if (admin){
            return admin;
        } else {
            return null;
        }
        
    } catch (error) {
        throw new Error(error);
    }
    }


module.exports = {
    getAdminByEmailAndPassword: getAdminByEmailAndPassword,
    getAdminByEmail: getAdminByEmail,
    addAdmin: addAdmin,
    deleteAdminById: deleteAdminById
}







