import mongoose from "mongoose";

const  StructureSchema = new mongoose.Schema({
   Course:{
     type : String,
     required:true,
   },
   Department:{
    type : String,
    required:true,
   },
   Branch:{
    type : String
   },
   Code:{
    type: String,
    required:true,
   }


})

StructureSchema.index({Course:1,Department:1,Branch:1},{unique:true});

const Structure = mongoose.model('Structure',StructureSchema);