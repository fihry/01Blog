package com.zeroOneBlog.Services;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.zeroOneBlog.Exceptions.ApiException;
import com.zeroOneBlog.Types.MinioBucketTypes;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.http.Method;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Qualifier;

@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    @Autowired
    @Qualifier("minioExternalClient")
    private MinioClient minioExternalClient;

    
    public String uploadFile(MultipartFile file) {
        MinioBucketTypes bucketType = getBucketByContentType(file.getContentType());
        String bucketName = bucketType.name().toLowerCase(); // images, videos, audios
        String objectName = UUID.randomUUID() + "-" + file.getOriginalFilename();

        try {
            // Auto-create bucket if missing
            if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());

                // Make images and videos buckets public
                if (bucketType == MinioBucketTypes.IMAGES || bucketType == MinioBucketTypes.VIDEOS) {
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

    public String getPermalink(String fullPath) {
        if (fullPath == null || fullPath.isBlank()) {
            return null;
        }
        return "/media/" + fullPath;
    }


    public String getMediaUrl(String fullPath) {
        if (fullPath == null || fullPath.isBlank()) {
            return null;
        }

        String[] parts = fullPath.split("/", 2);
        if (parts.length < 2) {
            return getPermalink(fullPath);
        }

        String bucket = parts[0];
        String object = parts[1];

        try {
            // Generate a presigned URL that is valid for 2 hours
            // This is safer and more efficient as it allows direct client-to-minio access
            return minioExternalClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(object)
                            .expiry(2, TimeUnit.HOURS)
                            .build()
            );
        } catch (Exception e) {
            System.err.println("Failed to generate presigned URL for: " + fullPath + " Error: " + e.getMessage());
            return getPermalink(fullPath);
        }
    }

    public InputStream getObjectStream(String bucket, String object) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucket)
                            .object(object)
                            .build()
            );
        } catch (Exception e) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Media not found");
        }
    }

    public StatObjectResponse getObjectStat(String bucket, String object) {
        try {
            return minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucket)
                            .object(object)
                            .build()
            );
        } catch (Exception e) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Media not found");
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