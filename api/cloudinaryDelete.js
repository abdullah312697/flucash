import { v2 as cloudinary } from 'cloudinary';
export const deleteResorce = async(publiId, fileType ) => {
    const result = await deleteStrem(publiId, fileType);
    return result;
}
const deleteStrem = (publiId, fileType) => {
    cloudinary.config({ 
        cloud_name:process.env.CLOUD_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret:process.env.CLOUDINARY_SECRET,
        secure:true,
    });
    

    // Determine resource_type based on fileType
    let resourceType = 'auto'; // 'auto' allows Cloudinary to automatically detect the resource type
    if (fileType.match(/video\/*/)) {
        resourceType = 'video';
    } else if (fileType.match(/image\/*/)) {
        resourceType = 'image';
    }

//wrapping into promise for using modern async/await
return new Promise((resolve, reject) => {
    cloudinary.api.delete_resources(publiId,{ type: 'upload', resource_type: resourceType, invalidate: true, }, (error, result) => {
        if (error) {
            reject(error);
        } else {
            resolve(result);
        }
    })
});
};
