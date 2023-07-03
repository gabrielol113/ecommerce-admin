const { Schema, model, models, default: mongoose } = require("mongoose");

const CategorySchema = new Schema({
    name: {type: String, required: true},
    parent: {type: mongoose.Types.ObjectId, ref:'Category'},
    properties: [{type: Object}],
    images: {type: [String]},
});

export const Category = models?.Category || model('Category',CategorySchema);
