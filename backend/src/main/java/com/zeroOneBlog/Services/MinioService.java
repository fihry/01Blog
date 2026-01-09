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
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;

@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;



    @Value("${minio.url.internal}")
    private String internalUrl;

    @Value("${minio.url.external}")
    private String externalUrl;

    public String uploadFile(MultipartFile file) {
        MinioBucketTypes bucketType = getBucketByContentType(file.getContentType());
        String bucketName = bucketType.name().toLowerCase();
        String objectName = UUID.randomUUID() + "-" + file.getOriginalFilename();

        try {
            if (!minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build())) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(bucketName).build());
            }

            minioClient.putObject(
                    io.minio.PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            return bucketName + "/" + objectName;

        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Failed to upload the file.");
        }
    }

    public String getPresignedUrl(String fullPath) {

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
            // Generate URL using internal client (which works)
            String url = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(object)
                            .expiry(84600)
                            .build()
            );

            // Replace internal URL with external URL for the browser
            // internalUrl: http://minio:9000
            // externalUrl: http://localhost:9000
            return url.replace(internalUrl, externalUrl);

        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot generate presigned link: " + e.getMessage());
        }
    }

    private MinioBucketTypes getBucketByContentType(String contentType) {
        if (contentType == null) {
            throw new IllegalArgumentException("Content type cannot be null");
        }

        switch (contentType.split("/")[0]) { // Take the part before "/"
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

    // Delete an uploaded object given its stored full path in the form "bucket/objectName"
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
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(object)
                            .build()
            );
        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete media");
        }
    }
}
