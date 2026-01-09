package com.zeroOneBlog.Services;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.zeroOneBlog.Exceptions.ApiException;
import com.zeroOneBlog.Types.MinioBucketTypes;

import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;

@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    @Value("${minio.url.internal}")
    private String internalUrl; // example: http://minio:9000

    @Value("${minio.url.external}")
    private String externalUrl; // example: http://localhost:9000

    /**
     * Upload a file to the correct bucket based on content type.
     * Returns the bucket/object path (e.g., images/uuid-file.png)
     */
    public String uploadFile(MultipartFile file) {
        MinioBucketTypes bucketType = getBucketByContentType(file.getContentType());
        String bucketName = bucketType.name().toLowerCase(); // images, videos, audios
        String objectName = UUID.randomUUID() + "-" + file.getOriginalFilename();

        try {
            // Auto-create bucket if missing
            if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());

                // Make only images bucket public
                if (bucketType == MinioBucketTypes.IMAGES) {
                    minioClient.setBucketPolicy(
                        io.minio.SetBucketPolicyArgs.builder()
                            .bucket(bucketName)
                            .config("{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":[\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::" + bucketName + "/*\"]}]}")
                            .build()
                    );
                }
            }

            // Upload file
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            return bucketName + "/" + objectName;

        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException(HttpStatus.BAD_REQUEST, "Failed to upload the file: " + e.getMessage());
        }
    }

    /**
     * Return the URL for front-end access.
     * - Images → public URL
     * - Videos / Audios → presigned URL
     */
    public String getMediaUrl(String fullPath) {
        if (fullPath == null || fullPath.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Media path is missing");
        }
        if (!fullPath.contains("/")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid media path format: " + fullPath);
        }

        String[] parts = fullPath.split("/", 2);
        String bucket = parts[0];
        String object = parts[1];

        // Public images
        if (bucket.equals("images")) {
            return externalUrl + "/" + bucket + "/" + object;
        }

        // Private media → presigned URL
        try {
            String presignedUrl = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(object)
                            .expiry(24 * 60 * 60) // 24h
                            .build()
            );
            
            // Replace internal URL with external URL for client access
            presignedUrl = presignedUrl.replace(internalUrl, externalUrl);
            
            return presignedUrl;
        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot generate presigned link: " + e.getMessage());
        }
    }

    /**
     * Delete an uploaded object given its stored full path (bucket/objectName)
     */
    public void deleteFile(String fullPath) {
        if (fullPath == null || fullPath.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Media path is missing");
        }
        if (!fullPath.contains("/")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid media path format: " + fullPath);
        }

        String[] parts = fullPath.split("/", 2);
        String bucket = parts[0];
        String object = parts[1];

        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(object)
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete media");
        }
    }

    /**
     * Determine bucket based on content type
     */
    private MinioBucketTypes getBucketByContentType(String contentType) {
        if (contentType == null) {
            throw new IllegalArgumentException("Content type cannot be null");
        }

        switch (contentType.split("/")[0]) {
            case "image":
                return MinioBucketTypes.IMAGES;
            case "video":
                return MinioBucketTypes.VIDEOS;
            case "audio":
                return MinioBucketTypes.AUDIOS;
            default:
                throw new IllegalArgumentException("Unsupported content type: " + contentType);
        }
    }
}