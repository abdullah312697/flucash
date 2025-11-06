import { v2 as cloudinary } from 'cloudinary';
export const uploadImage = async(fileStream, fileName, fname, fileType ) => {
    const result = await uploadStream(fileStream, fileName, fname, fileType  );
    return result;
}
const uploadStream = (fileStream, name, fname, fileType) => {
    cloudinary.config({ 
        cloud_name:process.env.CLOUD_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret:process.env.CLOUDINARY_SECRET,
        secure:true,
    });
    
    let fulderName = `nothun/${fname}`;

    // Determine resource_type based on fileType
    let resourceType = 'auto'; // 'auto' allows Cloudinary to automatically detect the resource type
    if (fileType.match(/video\/*/)) {
        resourceType = 'video';
    } else if (fileType.match(/image\/*/)) {
        resourceType = 'image';
    }

//wrapping into promise for using modern async/await
return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder:fulderName, public_id: name, resource_type: resourceType }, (error, result) => {
        if (error) {
            reject(error);
        } else {
            resolve(result);
        }
    }).end(fileStream)
});
};
