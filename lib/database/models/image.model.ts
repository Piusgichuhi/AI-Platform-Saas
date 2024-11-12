import { models, Schema, model , Document } from "mongoose";

//////////////////////
import { ObjectId } from 'mongodb';
 export interface IImage extends Document {
    title: string; // required string
    transformationTypes: string; // required string
    publicId: string; // required string
    secureUrl: URL; // required URL
    width?: number; // optional number
    height?: number; // optional number
    config?: Record<string, string>; // optional object for custom config
    transformationUrl?: URL; // optional URL for transformation URL
    aspectRatio?: string; // optional string (could represent ratios like '16:9')
    color?: string; // optional string (could be a color hex code)
    prompt?: string; // optional string (e.g., prompt used for image generation)
    author: ObjectId; // required ObjectId (reference to User)
    createdAt?: Date; // optional Date (auto-set by default in Mongo)
    updatedAt?: Date; // optional Date (auto-set on update in Mongo)
  }


  ///////////////////////
const ImageSchema = new Schema ({
    title:{ type: String, required: true},
    transformationTypes: {type: String, required: true}, 
    publicId: { type: String, required: true},
    secureUrl:{ type: URL, required: true }, 
    width:{type: Number},
    height:{type:Number},
    config:{type:Object},
    transformationUrl: {type: URL},
    aspectRatio:{type:String},
    color: {type:String},
    prompt: { type:String},
    author: {type:Schema.Types.ObjectId, ref: 'User'},
    createdAt: { type: Date , default: Date.now},
    updatedAt: { type:Date , default: Date.now}
});

const Image = models?.Image || model( 'Image',
    ImageSchema
);

export default Image;