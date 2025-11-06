import express from 'express';
const router = express.Router();
import productData from "../models/AddProduct.js";
import LogoAndNames from "../models/LogoAndNames.js";
import multerProcess from '../multerMiddleware.js';
import { uploadImage } from '../cloudinary.js';
import { deleteResorce } from '../cloudinaryDelete.js';
import multerVideoProcess from '../multerVideo.js';
import multerMultpleSameField from '../multerMSameField.js';

//single product data upload fro deshbord
router.post("/singleProduct/:fname", async(req,res) => {
    let fname = req.params.fname;
    multerMultpleSameField(req, res, async (err) => {
        if (err) {
            return res.json({message:err.message});
        }
        try {
            const files = req.files;
            const {ProductName, ColorVariant, SizeVariant, ProductPrice, PreviousPrice, ProductMainHeading, DescountPriceInPercent, TotalTargetSaleAmount, InStockQuentity, StartDate, EndDate} = req.body;
            if (!files) {
                return res.status(201).json({message:"No files uploaded!"});
            }else if(ProductName === "" || ColorVariant === "" || SizeVariant === "" || ProductPrice === "" || ProductMainHeading === "" || PreviousPrice === "" || DescountPriceInPercent === "" || TotalTargetSaleAmount === "" ||
            InStockQuentity === "" || StartDate === "" || EndDate === ""){
                res.status(201).json({message:"Field must not be Empty!"})
            }else{
                const uploadResults = {};
                for (const fieldName in files) {
                    const file = files[fieldName][0];
                    const { buffer } = file;
                    const fileType = file.mimetype; // MIME type of the file
                    const imageName = new Date().getTime().toString();
                    const result = await uploadImage(buffer, imageName, fname, fileType);
                    uploadResults[fieldName] = {image:result.secure_url,publicId:result.public_id};
                }
                    const {FrontImage, BackImage} = await uploadResults;
                const uploadData = new productData({ProductName, ColorVariant, SizeVariant, FrontImage, BackImage, ProductPrice, ProductMainHeading, PreviousPrice, DescountPriceInPercent, 
                    TotalTargetSaleAmount, InStockQuentity, StartDate, EndDate,
                });
                await uploadData.save();
                return res.status(200).json({
                    message: 'Product Upload Successfully!',
                    user: uploadData,
                  });        
            }
        }catch (error) {
            console.log(error);
            return res.status(201).json({message:"Failed to upload!"});
        }
    })
});
// brand name and logo start
router.put("/logoandName/:fname/:brandId/:publicId", async(req,res) => {
    multerProcess(req, res, async (err) => {
        const {fname,brandId,publicId} = req.params;
        if (err) {
            return res.json({message:err.message});
        }
        try {
            const files = req.file;
            const {brandName} = req.body;
            if (!files && brandName !== "") {
                const changeNameAndLogo = await LogoAndNames.findByIdAndUpdate(brandId,
                    {$set:{brandName:brandName}},{new:true,upsert:true,runValidators:true});
                    if(!changeNameAndLogo){
                        res.status(201).json({message: 'cannot find by this id'}); 
                    }
                res.status(200).json({
                    message: 'Only Brand name Changed!',
                    data: changeNameAndLogo,
                }); 
            }else if(files && brandName === ""){
                await deleteResorce(publicId,'image');
                const imageStream = req.file.buffer;
                const fileType = files.mimetype; // MIME type of the file
                const imageName = new Date().getTime().toString();
                const uploadResult = await uploadImage(imageStream, imageName, fname, fileType);
                const barndLogo = await uploadResult.secure_url;
                const CloudinaryPublicId  = await uploadResult.public_id;
                const changeNameAndLogo = await LogoAndNames.findByIdAndUpdate(brandId,
                    {$set:{barndLogo:barndLogo,CloudinaryPublicId:CloudinaryPublicId}},{new:true,upsert:true,runValidators:true});
                    if(!changeNameAndLogo){
                        res.status(201).json({message: 'cannot find by this id'}); 
                    }
                res.status(200).json({
                    message: 'Only logo Changed!',
                    data: changeNameAndLogo,
                }); 
            }else{
                await deleteResorce(publicId,'image');
                const imageStream = req.file.buffer;
                const fileType = files.mimetype; // MIME type of the file
                const imageName = new Date().getTime().toString();
                const uploadResult = await uploadImage(imageStream, imageName, fname, fileType);
                const barndLogo = await uploadResult.secure_url;
                const CloudinaryPublicId  = await uploadResult.public_id;
                const changeNameAndLogo = await LogoAndNames.findByIdAndUpdate(brandId,
                    {$set:{brandName:brandName,barndLogo:barndLogo,CloudinaryPublicId:CloudinaryPublicId}},{new:true,upsert:true,runValidators:true});
                    if(!changeNameAndLogo){
                        res.status(201).json({message: 'cannot find by this id'}); 
                    }
                res.status(200).json({
                    message: 'Brand name and logo Changed!',
                    data: changeNameAndLogo,
                }); 

            }
        }catch (error) {
            console.log(error);
            return res.status(201).json({message:"Failed to upload!"});
        }
    })
});
// slider Images uploded start

//get logoAnd name <>
router.get("/getLogoandName", async(req,res) => {
    const logandName = await LogoAndNames.find();
    if(!logandName){
        res.status(201).json({message:"data not found!"})
    }
    res.status(200).json({message:"this is your data!", data:logandName})
});
//get logo and name</>

//start get all products <>
    router.get("/allProducs", async(req,res) => {
        try{
            const data = await productData.find();
            if(data){
                res.status(200).json(data);
            }else{
                res.status(201).json("data not found");
            }
        }catch(error){
            console.log(error);
            return res.status(201).json({message:"Failed to get Product!"});
        }
    })
//end get all products </>
//start get all public products <>
router.get("/allPublicProducs", async(req,res) => {
    try{
        const data = await productData.find({IsPublic:true}).select('_id ProductVideos ProductPhotos ProductFutures ProductMainHeading ProductSpecification ProductDescription ProductPrice ProductName');
        if(data){
            res.status(200).json(data);
        }else{
            res.status(201).json("data not found");
        }
    }catch(error){
        console.log(error);
        return res.status(201).json({message:"Failed to get Product!"});
    }
})
//end get all public products </>
//start get single public productById <>
router.get("/SinglePublicProduct/:productId", async(req,res) => {
    const ProductId = req.params.productId;
    try{
        const data = await productData.findOne({_id:ProductId},
            { 
                ProductName: 1, 
                ProductPrice: 1, 
                PreviousPrice: 1, 
                DescountPriceInPercent: 1, 
                ProductFutures: 1, 
                ProductSpecification: 1, 
                ProductColors: 1, 
                InStock: 1,
                InStockAvailableQuentity:1,
                ProductShortDescription:1,
                ProductSize:1,
            }
        );

        if(data){
            res.status(200).json(data);
        }else{
            res.status(201).json("data not found");
        }
    }catch(error){
        console.log(error);
        return res.status(201).json({message:"Failed to get Product!"});
    }
})
//end get single public productById </>

// get singleProduct by Id start <>
    router.get("/singleProductData/:id", async(req,res) => {
        const productId = req.params.id;
        try{  
            const data = await productData.findById(productId).exec();
            if(data){
                res.status(200).json(data);
            }else{
                res.status(201).json("data not found");
            }
        }catch(error){
            console.log(error);
            return res.status(201).json({message:"Failed to get Product!"});
        }
    });
// get singleProduct by Id end </>

//update single Product<>
    router.put("/singleProductUpdate/:fname/:productId", async(req,res) => {
        const {productId,fname} = req.params;
        multerProcess(req, res, async (err) => {
            if (err) {
                return res.json({message:err.message});
            }
            try {
                const files = req.file;
                const ProductData = req.body;
                const checkEmpty = JSON.stringify(ProductData);
                    if(files && checkEmpty === '{}'){
                        const fileType = files.mimetype; // MIME type of the file
                        const imageStream = await req.file.buffer;
                        const imageName = new Date().getTime().toString();
                        const uploadResult = await uploadImage(imageStream, imageName, fname, fileType);
                        const ProductImg = await uploadResult.secure_url;
                        const CloudinaryPublicId = await uploadResult.public_id;
                        const setBody = {ProductImg:ProductImg,CloudinaryPublicId:CloudinaryPublicId}
                        const setUdata = await productData.findByIdAndUpdate(productId, { $set: setBody}, {new: true, upsert: true});
                        if(setUdata){
                            res.status(200).json({
                                message: 'only Product Image Successfully!',
                                data: setUdata,
                              })
                        }
                    }else if(files && checkEmpty !== '{}'){
                        const fileType = files.mimetype; // MIME type of the file
                        const imageStream = await req.file.buffer;
                        const imageName = new Date().getTime().toString();
                        const uploadResult = await uploadImage(imageStream, imageName, fname, fileType);
                        const ProductImg = await uploadResult.secure_url;
                        const CloudinaryPublicId = await uploadResult.public_id;
                        const setUdata = await productData.findByIdAndUpdate(productId, { $set: ProductData, ProductImg:ProductImg,CloudinaryPublicId:CloudinaryPublicId }, {new: true, upsert: true});
                        if(setUdata){
                            res.status(200).json({
                                message: 'Product Upload Successfully!',
                                data: setUdata,
                              })
                        }
                    }else{
                        const setUdata = await productData.findByIdAndUpdate(productId, { $set: ProductData}, {new: true, upsert: true});
                        if(setUdata){
                            res.status(200).json({
                                message: 'Product Upload Successfully!',
                                data: setUdata,
                              })
                        }
                    }
                
            }catch (error) {
                console.log(error);
                return res.status(201).json({message:"Failed to upload!"});
            }
        })
    });
//update single Product</>
//delete product<>
router.delete("/DeleteSingleProduct/:productId/:publicId", async(req,res) => {
    const {productId,publicId} = req.params;
    try {
        await deleteResorce(publicId,'image');
        const deleteProduct = await productData.findByIdAndDelete(productId);
          if(deleteProduct){
            res.status(200).json({ message: 'Product deleted successfully' , data:deleteProduct});
          }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
      } 
    
});
//delete Product</>

//upload productVideos<>
router.put("/uploadVideos/:fname/:productId", async(req,res) => {
    const {productId,fname} = req.params;
    multerVideoProcess(req, res, async (err) => {
        if (err) {
            return res.json({message:err.message});
        }
        try {
            const files = req.file;
                if(!files){
                     res.status(201).json({message:"file not selected!"});
                }else{
                    const imageStream = await req.file.buffer;
                    const fileType = files.mimetype; // MIME type of the file
                    const imageName = new Date().getTime().toString();
                    const uploadResult = await uploadImage(imageStream, imageName, fname, fileType);
                    const video = await uploadResult.secure_url;
                    const CloudinaryPublicId = await uploadResult.public_id;
                    const setVideodata = await productData.findByIdAndUpdate(productId, 
                        { $push: { ProductVideos: {videoUrl:video,CloudinaryPublicId:CloudinaryPublicId,fileType:fileType} } }, {new: true, upsert: true});
                    if(setVideodata){
                        res.status(200).json({
                            message: 'Video Upload Successfully!',
                            data: setVideodata,
                          })
                    }
                }
            
        }catch (error) {
            console.log(error);
            return res.status(201).json({message:"Failed to upload!"});
        }
    })
});
//upload productVideos</>
//delete videos<>
router.delete("/deleteVideo/:productId/:videosId/:publicId", async(req,res) => {
    const {productId,videosId,publicId} = req.params;
    try {

        await deleteResorce(publicId,'video');
        const deleteVideos = await productData.findByIdAndUpdate(
            productId,
            { $pull: { ProductVideos: { _id: videosId } } }, 
            { new: true } 
          );
          if(deleteVideos){
            res.status(200).json({ message: 'Video deleted successfully' , data:deleteVideos});
          }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
      } 
    
});
//delete videos</>
//upload porductPhotos<>
router.put("/uploadPhotos/:fname/:productId", async(req,res) => {
    const {productId,fname} = req.params;
    multerProcess(req, res, async (err) => {
        if (err) {
            return res.json({message:err.message});
        }
        try {
            const {backgroundType} = req.body;
            const files = req.file;
                if(!files){
                     res.status(201).json({message:"file not selected!"});
                }else{
                    const imageStream = await req.file.buffer;
                    const fileType = files.mimetype; // MIME type of the file
                    const imageName = new Date().getTime().toString();
                    const uploadResult = await uploadImage(imageStream, imageName, fname, fileType);
                    const Image = await uploadResult.secure_url;
                    const CloudinaryPublicId = await uploadResult.public_id;
                    const setPhotosData = await productData.findByIdAndUpdate(productId, 
                        { $push: { ProductPhotos: {photoUrl:Image,CloudinaryPublicId:CloudinaryPublicId,fileType:fileType,backgroundType:backgroundType} } }, {new: true, upsert: true});
                    if(setPhotosData){
                        res.status(200).json({
                            message: 'Photo Upload Successfully!',
                            data: setPhotosData,
                          })
                    }
                }
            
        }catch (error) {
            console.log(error);
            return res.status(201).json({message:"Failed to upload!"});
        }
    })
});
//upload porductPhotos</>
//photo delete<>
router.delete("/deletePhotos/:productId/:photoId/:publicId", async(req,res) => {
    const {productId,photoId,publicId} = req.params;
    try {
        await deleteResorce(publicId,'image');
        const deletePhotos = await productData.findByIdAndUpdate(
            productId,
            { $pull: { ProductPhotos: { _id: photoId } } }, 
            { new: true } 
          );
          if(deletePhotos){
            res.status(200).json({ message: 'Photo deleted successfully' , data:deletePhotos});
          }

        // res.json({ message: 'Photo deleted successfully' , data:updateddata});
      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      } 
    
});
//photo delete</>
//upload product Feauter<>
router.put("/updateFeauter/:productId", async(req,res) => {
        try {
            const {productId} = req.params;
            const {ProductFeauterKey,ProductFeauterVal} = req.body;
            if(ProductFeauterKey === "" || ProductFeauterVal === ""){
                res.status(201).json({message: "don't have data to upload!"})
            }

            const getProduct = await productData.findByIdAndUpdate(productId, 
                { $push: { ProductFutures: {key:ProductFeauterKey,value:ProductFeauterVal} } }, {new: true, upsert: true});
            if(getProduct){
                res.status(200).json({
                    message: 'Feauters Upload Successfully!',
                    data: getProduct
                    });
            }       
        }catch (error) {
            console.log(error);
            return res.status(201).json({message:"Failed to upload!"});
        }
});
//upload product Feauter</>
//product FeutersKeyValue update<>
router.put("/updateFeautureKeyValue/:productId/:featureId/", async(req,res) => {
    const {productId,featureId} = req.params;
    const {key,value} = req.body;
    try {
        const update = {};
        if (key !== undefined) update["ProductFutures.$[elem].key"] = key;
        if (value !== undefined) update["ProductFutures.$[elem].value"] = value;
        if (Object.keys(update).length === 0) {
            return res.status(400).json({ message: 'No valid key or value provided for update' });
        }
        const updatedProduct = await productData.findByIdAndUpdate(
            productId,
            { $set: update },
            { arrayFilters: [{ "elem._id": featureId }], new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product or feature not found' });
        }

        res.status(200).json({ message: 'Feature updated successfully', data: updatedProduct });

      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      } 
    
});
//product FeutersKeyValue update</>
//product Feuters delete<>
router.delete("/deleteFutures/:productId/:feauterId/", async(req,res) => {
    const {productId,feauterId} = req.params;
    try {
        const updatedProduct = await productData.findByIdAndUpdate(
            productId,
            { $pull: { ProductFutures: { _id: feauterId } } }, 
            { new: true } 
          );
          if(updatedProduct){
            res.status(200).json({ message: 'future deleted successfully' , data:updatedProduct});
          }
      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      } 
    
});
//product Feuters delete</>
//upload product Specification<>
router.put("/updateSpecification/:productId", async(req,res) => {
    try {
        const {productId} = req.params;
        const {ProductSpcKey,ProductSpcVal} = req.body;
        if(ProductSpcKey === "" || ProductSpcVal === ""){
            res.status(201).json({message: "don't have data to upload!"})
        }
        const getProduct = await productData.findByIdAndUpdate(productId, 
            { $push: { ProductSpecification: {spcKey:ProductSpcKey,spcValue:ProductSpcVal} } }, {new: true, upsert: true});
        if(getProduct){
            res.status(200).json({
                message: 'Feauters Upload Successfully!',
                data: getProduct
                });
        }       
    }catch (error) {
        console.log(error);
        return res.status(201).json({message:"Failed to upload!"});
    }
});
//upload product Specification</>
//product specification update key value<>
router.put("/updateSpcficKeyValue/:productId/:featureId/", async(req,res) => {
    const {productId,featureId} = req.params;
    const {key,value} = req.body;
    try {
        const update = {};
        if (key !== undefined) update["ProductSpecification.$[elem].spcKey"] = key;
        if (value !== undefined) update["ProductSpecification.$[elem].spcValue"] = value;
        if (Object.keys(update).length === 0) {
            return res.status(201).json({ message: 'No valid key or value provided for update' });
        }
        const updatedProduct = await productData.findByIdAndUpdate(
            productId,
            { $set: update },
            { arrayFilters: [{ "elem._id": featureId }], new: true }
        );

        if (!updatedProduct) {
            return res.status(201).json({ message: 'Product or Specification not found' });
        }

        res.status(200).json({ message: 'Specification updated successfully', data: updatedProduct });

      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      } 
    
});
//product specification update key value</>
//product Specification delete<>
router.delete("/deleteSpecification/:productId/:feauterId/", async(req,res) => {
    const {productId,feauterId} = req.params;
    try {
        const updatedProduct = await productData.findByIdAndUpdate(
            productId,
            { $pull: { ProductSpecification: { _id: feauterId } } }, 
            { new: true } 
          );
          if(updatedProduct){
            res.status(200).json({ message: 'future deleted successfully' , data:updatedProduct});
          }
      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      } 
    
});
//product Specification delete</>
//upload product Specification<>
router.put("/updateDescription/:fname/:productId", async(req,res) => {
    multerProcess(req, res, async (err) => {
        if (err) {
            return res.json({message:err.message});
        }
    try {
        const {productId,fname} = req.params;
        const {ProductDescHeadig,ProductDescVal} = req.body;
        const files = req.file;
            if(!files){
                 res.status(201).json({message:"file not selected!"});
            }else if(ProductDescHeadig === "" || ProductDescVal === ""){
                res.status(201).json({message: "don't have data to upload!"})
            }else{
                const imageStream = await req.file.buffer;
                const fileType = files.mimetype; // MIME type of the file
                const imageName = new Date().getTime().toString();
                const uploadResult = await uploadImage(imageStream, imageName, fname, fileType);
                const Image = await uploadResult.secure_url;
                const CloudinaryPublicId = await uploadResult.public_id;
                    const setPhotosData = await productData.findByIdAndUpdate(productId, 
                        { $push: { ProductDescription: {heading:ProductDescHeadig,descripTion:ProductDescVal,photoUrl:Image,CloudinaryPublicId:CloudinaryPublicId,fileType:fileType} } }, {new: true, upsert: true});            
                if(setPhotosData){
                    res.status(200).json({
                        message: 'Description Upload Successfully!',
                        data: setPhotosData,
                      })
                }
            }
    }catch (error) {
        console.log(error);
        return res.status(201).json({message:"Failed to upload!"});
    }
})
});
//upload product Specification</>
//product details update key value<>
router.put("/updateDescriptionKeyValue/:productId/:detailsId/", async(req,res) => {
    const {productId,detailsId} = req.params;
    const {key,value} = req.body;
    try {
        const update = {};
        if (key !== undefined) update["ProductDescription.$[elem].heading"] = key;
        if (value !== undefined) update["ProductDescription.$[elem].descripTion"] = value;
        if (Object.keys(update).length === 0) {
            return res.status(201).json({ message: 'No valid key or value provided for update' });
        }
        const updatedProduct = await productData.findByIdAndUpdate(
            productId,
            { $set: update },
            { arrayFilters: [{ "elem._id": detailsId }], new: true }
        );

        if (!updatedProduct) {
            return res.status(201).json({ message: 'Product or Specification not found' });
        }

        res.status(200).json({ message: 'Specification updated successfully', data: updatedProduct });

      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      } 
    
});
//product details update key value</>
//product Description delete<>
router.delete("/deleteDescription/:productId/:feauterId/:cloudinayPid", async(req,res) => {
    const {productId,feauterId,cloudinayPid} = req.params;
    try {
        await deleteResorce(cloudinayPid,'image');
        const updatedProduct = await productData.findByIdAndUpdate(
            productId,
            { $pull: { ProductDescription: { _id: feauterId } } }, 
            { new: true } 
          );
          if(updatedProduct){
            res.status(200).json({ message: 'Description deleted successfully' , data:updatedProduct});
          }
      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      } 
    
});
//product Description delete</>
//product InStock Toggle<>
router.put("/toggeInStock/:productId/", async(req,res) => {
    try {
        const {productId} = req.params;
        const {toggleName} = req.body;    
        const updatedProduct = await productData.findByIdAndUpdate(
            productId,
            { $set:  {InStock:toggleName}}
        );
        if (!updatedProduct) {
            return res.status(201).json({ message: 'Product not found' });
        }
        const data = await productData.find();
        if(!data){
            res.status(201).json("data not found");
        }
        res.status(200).json({ message: 'Product Stock updated successfully', data: data });
      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      } 
    
});
//product InStock Toggle</>
//product isPublic Toggle<>
router.put("/toggeInPublic/:productId/", async(req,res) => {
    try {
        const {productId} = req.params;
        const {toggleName} = req.body;    
        const updatedProduct = await productData.findByIdAndUpdate(
            productId,
            { $set:  {IsPublic:toggleName}},
            {new:true}
        );
        if (!updatedProduct) {
            return res.status(201).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Public is now Public', data: updatedProduct });
      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      } 
    
});
//product isPublic Toggle</>
//upload porductColorAndPhotos<>
router.put("/productColorUpload/:fname/:productId", async(req,res) => {
    multerProcess(req, res, async (err) => {
        const {productId,fname} = req.params;
        const {colorName} = req.body;
        if (err) {
            return res.json({message:err.message});
        }
        try {
            const files = req.file;
                if(!files){
                     res.status(201).json({message:"file not selected!"});
                }else{
                    const imageStream = await req.file.buffer;
                    const fileType = files.mimetype; // MIME type of the file
                    const imageName = new Date().getTime().toString();
                    const uploadResult = await uploadImage(imageStream, imageName, fname, fileType);
                    const Image = await uploadResult.secure_url;
                    const CloudinaryPublicId = await uploadResult.public_id;
                    const setColordata = await productData.findByIdAndUpdate(productId, 
                        { $push: { ProductColors: {colorName:colorName,colorImage:Image,CloudinaryPublicId:CloudinaryPublicId,fileType:fileType} } }, {new: true, upsert: true});
                    if(setColordata){
                        res.status(200).json({
                            message: 'Color Upload Successfully!',
                            data: setColordata,
                          })
                    }
                }
            
        }catch (error) {
            console.log(error);
            return res.status(201).json({message:"Failed to upload!"});
        }
    })
});
//upload porductColorAndPhotos</>
//delete colorPhotos<>
router.delete("/deleteProductColor/:productId/:publicId/:photoId", async(req,res) => {
    const {productId,publicId,photoId} = req.params;
    try {
        await deleteResorce(publicId,'image');
        const deletePhotos = await productData.findByIdAndUpdate(
            productId,
            { $pull: { ProductColors: { _id: photoId } } }, 
            { new: true } 
          );
          if(deletePhotos){
            res.status(200).json({ message: 'Color deleted successfully' , data:deletePhotos});
          }

      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      }  
});
//delete colorPhotos</>
//get ony some field from all product<>
router.get("/getSomeFieldForSlidr", async(req,res) => {
    try {
        const docs = await productData.find({}, '_id ProductName ProductImg');
        if(docs){
            res.status(200).json({data:docs});
        }
      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      }  
});
//get ony some field from all product</>

//update or add product short heading<>
router.put("/updateShortHeading/:productId/", async(req,res) => {
    const {productId} = req.params;
    const {productShortHeading} = req.body;
    try {
        const updatedProduct = await productData.findByIdAndUpdate(
            productId,
            { $set: {'ProductShortDescription.productShortHeading' : productShortHeading}},
            { new: true, upsert:true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'faild to set short heading' });
        }

        res.status(200).json({ message: 'short heading set successfully', data: updatedProduct.ProductShortDescription.productShortHeading });
      } catch (error) {
        console.error(error);
        res.status(501).json({ message: 'Server Error' });
      } 
});
//update or add product short heading<>

//add product variant <>
router.put("/setVariations/:productId", async(req,res) => {
    try {
        const {productId} = req.params;
        const {ProductFeauterKey,ProductFeauterVal} = req.body;
        if(ProductFeauterKey === "" || ProductFeauterVal === ""){
            res.status(201).json({message: "don't have data to upload!"})
        }

        const getProduct = await productData.findByIdAndUpdate(productId, 
            { $push: { 'ProductShortDescription.productShortDescVariations' : {key:ProductFeauterKey,value:ProductFeauterVal} } }, {new: true, upsert: true});
        if(getProduct){
            res.status(200).json({
                message: 'Feauters Upload Successfully!',
                data: getProduct.ProductShortDescription.productShortDescVariations
                });
        }       
    }catch (error) {
        console.log(error);
        return res.status(201).json({message:"Failed to upload!"});
    }
});
//add product variant </>
//add product Key Attributes <>
router.put("/setKeyAttrubutes/:productId", async(req,res) => {
    try {
        const {productId} = req.params;
        const {ProductFeauterKey,ProductFeauterVal} = req.body;
        if(ProductFeauterKey === "" || ProductFeauterVal === ""){
            res.status(201).json({message: "don't have data to upload!"})
        }

        const getProduct = await productData.findByIdAndUpdate(productId, 
            { $push: { 'ProductShortDescription.productShortDescKeyAttributes' : {key:ProductFeauterKey,value:ProductFeauterVal} } }, {new: true, upsert: true});
        if(getProduct){
            res.status(200).json({
                message: 'Feauters Upload Successfully!',
                data: getProduct.ProductShortDescription.productShortDescKeyAttributes
                });
        }       
    }catch (error) {
        console.log(error);
        return res.status(201).json({message:"Failed to upload!"});
    }
});
//add product Key Attributes </>
//add product Other attributes <>
router.put("/setOtherAttrubutes/:productId", async(req,res) => {
    try {
        const {productId} = req.params;
        const {ProductFeauterKey,ProductFeauterVal} = req.body;
        if(ProductFeauterKey === "" || ProductFeauterVal === ""){
            res.status(201).json({message: "don't have data to upload!"})
        }

        const getProduct = await productData.findByIdAndUpdate(productId, 
            { $push: { 'ProductShortDescription.productShortDescOtherAttributes' : {key:ProductFeauterKey,value:ProductFeauterVal} } }, {new: true, upsert: true});
        if(getProduct){
            res.status(200).json({
                message: 'Feauters Upload Successfully!',
                data: getProduct.ProductShortDescription.productShortDescOtherAttributes
                });
        }       
    }catch (error) {
        console.log(error);
        return res.status(201).json({message:"Failed to upload!"});
    }
});
//add product Other attributes </>

//updateVariations, updateKeyAttrubutes, updateOtherAttrubutes,

//product updateVariations<>
router.put("/updateVariations/:productId/:featureId/", async(req,res) => {
const {productId,featureId} = req.params;
const {key,value} = req.body;
try {
    const update = {};
    if (key !== undefined) update["ProductShortDescription.productShortDescVariations.$[elem].key"] = key;
    if (value !== undefined) update["ProductShortDescription.productShortDescVariations.$[elem].value"] = value;
    if (Object.keys(update).length === 0) {
        return res.status(400).json({ message: 'No valid key or value provided for update' });
    }
    const updatedProduct = await productData.findByIdAndUpdate(
        productId,
        { $set: update },
        { arrayFilters: [{ "elem._id": featureId }], new: true }
    );

    if (!updatedProduct) {
        return res.status(404).json({ message: 'Product or feature not found' });
    }

    res.status(200).json({ message: 'Feature updated successfully', data: updatedProduct.ProductShortDescription.productShortDescVariations });

  } catch (error) {
    console.error(error);
    res.status(201).json({ message: 'Server Error' });
  } 

});
//product updateVariations</>
//product updateKeyAttrubutes<>
router.put("/updateKeyAttrubutes/:productId/:featureId/", async(req,res) => {
    const {productId,featureId} = req.params;
    const {key,value} = req.body;
    try {
        const update = {};
        if (key !== undefined) update["ProductShortDescription.productShortDescKeyAttributes.$[elem].key"] = key;
        if (value !== undefined) update["ProductShortDescription.productShortDescKeyAttributes.$[elem].value"] = value;
        if (Object.keys(update).length === 0) {
            return res.status(400).json({ message: 'No valid key or value provided for update' });
        }
        const updatedProduct = await productData.findByIdAndUpdate(
            productId,
            { $set: update },
            { arrayFilters: [{ "elem._id": featureId }], new: true }
        );
    
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product or feature not found' });
        }
    
        res.status(200).json({ message: 'Feature updated successfully', data: updatedProduct.ProductShortDescription.productShortDescKeyAttributes });
    
      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      } 
    
    });
//product updateKeyAttrubutes</>
//product updateOtherAttrubutes<>
router.put("/updateOtherAttrubutes/:productId/:featureId/", async(req,res) => {
    const {productId,featureId} = req.params;
    const {key,value} = req.body;
    try {
        const update = {};
        if (key !== undefined) update["ProductShortDescription.productShortDescOtherAttributes.$[elem].key"] = key;
        if (value !== undefined) update["ProductShortDescription.productShortDescOtherAttributes.$[elem].value"] = value;
        if (Object.keys(update).length === 0) {
            return res.status(400).json({ message: 'No valid key or value provided for update' });
        }
        const updatedProduct = await productData.findByIdAndUpdate(
            productId,
            { $set: update },
            { arrayFilters: [{ "elem._id": featureId }], new: true }
        );
    
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product or feature not found' });
        }
    
        res.status(200).json({ message: 'Feature updated successfully', data: updatedProduct.ProductShortDescription.productShortDescOtherAttributes });
    
      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      } 
    
    });
//product updateOtherAttrubutes</>
        
//product Feuters delete<>
router.delete("/deleteShortDescription/:productId/:featureId/:fromDelete/", async (req, res) => {
    const { productId, featureId, fromDelete } = req.params;
    try {
      const updateQuery = {};
      updateQuery[`ProductShortDescription.${fromDelete}`] = { _id: featureId };
  
      const updatedProduct = await productData.findByIdAndUpdate(
        productId,
        { $pull: updateQuery },
        { new: true }
      );
  
      if (updatedProduct) {
        return res.status(200).json({ message: 'Feature deleted successfully', data: featureId });
      } else {
        return res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server Error' });
    }
  });
  // product Feuters delete</>

  //upload/add product Size<>
router.put("/addProductSize/:productId", async(req,res) => {
    try {
        const {productId} = req.params;
        const {ProductSize} = req.body;
        if(ProductSize === ""){
            res.status(201).json({message: "don't have data to upload!"})
        }
        const getProduct = await productData.findByIdAndUpdate(productId, 
            { $push: {ProductSize:ProductSize} }, {new: true, upsert: true});
        if(getProduct){
            res.status(200).json({
                message: 'Feauters Upload Successfully!',
                data: getProduct
                });
        }       
    }catch (error) {
        console.log(error);
        return res.status(201).json({message:"Failed to upload!"});
    }
});
//upload/add product Size</>
//Update Product Size<>
router.put("/updateProductSize/:productId/", async(req,res) => {
    const {productId} = req.params;
    const {ProductSize,ProductOldSize} = req.body;
    try {
        const product = await productData.findById(productId);
        const index = product.ProductSize.indexOf(ProductOldSize);
        if (index !== -1) {
          product.ProductSize[index] = ProductSize; // Update the value at the found index
          const updatedProduct = await product.save();
          res.status(200).json({ message: 'Size updated successfully', data: updatedProduct });
        } else {
            res.status(501).json({ message: 'Size not updated!'});
        }
      } catch (error) {
        console.error(error);
        res.status(501).json({ message: 'Server Error' });
      } 
    
});
//Update Product Size</>
//Delete product Size<>
router.delete("/deleteProductSize/:productId/:delSize/", async(req,res) => {
    const {productId,delSize} = req.params;
    try {
        const updatedProduct = await productData.findByIdAndUpdate(
            productId,
            { $pull: { ProductSize: delSize } }, 
            { new: true } 
          );
          if(updatedProduct){
            res.status(200).json({ message: 'Size deleted successfully' , data:updatedProduct});
          }
      } catch (error) {
        console.error(error);
        res.status(201).json({ message: 'Server Error' });
      } 
    
});
//Delete product Size </>

export default router;