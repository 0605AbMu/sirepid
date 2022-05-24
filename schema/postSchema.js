const joi = require("joi");

module.exports = {
    addPostSchema: joi.object({
        caption: joi.string().min(4).required(),
        description: joi.string().min(10).required(),
        createdPostDate: joi.date().required()
    }).required(),
    updatePostSchema: joi.object({
        caption: joi.string().min(4).required().optional(),
        description: joi.string().min(10).required().optional(),
        createdPostDate: joi.date().required()
    }).required(),
}


