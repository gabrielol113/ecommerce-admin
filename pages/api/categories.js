import { Category } from "@/models/Category";
import { mongooseConnect } from "@/lib/mongoose";
import { authOption } from "./auth/[...nextauth]";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handle(req, res){
    const { method } = req;    
    await mongooseConnect();
    await isAdminRequest(req,res);

    if(method === 'POST'){
        const {name, parentCategory, properties, images} = req.body;
        const categoryDoc = await Category.create({
            name, 
            parent: parentCategory || '',
            properties: properties,
            images
        });
        res.json(categoryDoc);

    }
    if(method === 'GET'){
        if(req.query?.id){
            res.json(await Category.findOne({_id: req.query.id}))
        }else{
            res.json(await Category.find().populate('parent'));
        }
    }
    if(method === 'PUT'){
        const {name, parentCategory, properties, images, _id} = req.body;
        
        const categoryDoc = await Category.updateOne({_id},{
            name, 
            parent: parentCategory || undefined,
            properties,
            images,
        });
        console.log('passou');
        res.json(categoryDoc);
    }
    if(method === 'DELETE'){
        const { _id } = req.query;
        if(_id){
            res.json(await Category.deleteOne({_id}));
        }
    }
}