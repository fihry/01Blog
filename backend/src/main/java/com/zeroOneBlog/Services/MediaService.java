package com.zeroOneBlog.Services;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.zeroOneBlog.Exceptions.ApiException;
import com.zeroOneBlog.Types.MediaType;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${storage.bucket}")
    private String defaultBucket;

    @Value("${storage.public-endpoint}")
    private String publicUrl;

    /**
     * Upload a file to S3-compatible storage.
     * Returns the path: bucketName/objectName
     */
    public String uploadFile(MultipartFile file) {
        MediaType bucketType = getBucketByContentType(file.getContentType());
        String bucketName = bucketType.name().toLowerCase();
        String objectName = UUID.randomUUID() + "-" + file.getOriginalFilename();

        try {
            if (!doesBucketExist(bucketName)) {
                s3Client.createBucket(CreateBucketRequest.builder()
                        .bucket(bucketName)
                        .build());
            }

            // Read file fully into memory to avoid mark/reset issues
            byte[] bytes = file.getBytes();

            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectName)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(bytes) // <-- Safe, repeatable
            );

            return bucketName + "/" + objectName;

        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read file: " + e.getMessage());
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Failed to upload the file: " + e.getMessage());
        }
    }

    /**
     * Generate public URL or presigned URL
     */
    public String getMediaUrl(String fullPath) {
        if (fullPath == null || fullPath.isBlank() || !fullPath.contains("/")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid media path: " + fullPath);
        }

        String[] parts = fullPath.split("/", 2);
        String bucket = parts[0];
        String object = parts[1];

        // if (bucket.equals("images") || bucket.equals("videos")) {
        //     return publicUrl + "/" + bucket + "/" + object;
        // }

        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(object)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofHours(1))
                    .getObjectRequest(getObjectRequest)
                    .build();
            System.out.println(s3Presigner.presignGetObject(presignRequest).url().toString());
            return s3Presigner.presignGetObject(presignRequest).url().toString();

        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot generate presigned URL: " + e.getMessage());
        }
    }

    public void deleteFile(String fullPath) {
        if (fullPath == null || fullPath.isBlank() || !fullPath.contains("/")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid media path: " + fullPath);
        }

        String[] parts = fullPath.split("/", 2);
        String bucket = parts[0];
        String object = parts[1];

        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(object)
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete media");
        }
    }

    private boolean doesBucketExist(String bucketName) {
        try {
            s3Client.headBucket(HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build());
            return true;
        } catch (NoSuchBucketException e) {
            return false;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error checking bucket existence: " + e.getMessage());
        }
    }

    private MediaType getBucketByContentType(String contentType) {
        if (contentType == null)
            throw new IllegalArgumentException("Content type cannot be null");

        switch (contentType.split("/")[0]) {
            case "image":
                return MediaType.IMAGES;
            case "video":
                return MediaType.VIDEOS;
            case "audio":
                return MediaType.AUDIOS;
            default:
                throw new IllegalArgumentException("Unsupported content type: " + contentType);
        }
    }
}
