package com.zeroOneBlog.Services;

import java.util.Map;
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
            String presigned = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(object)
                            .expiry(84600)
                            .extraQueryParams(Map.of("X-Amz-Endpoint", externalUrl))
                            .build()
            );

            // Log the generated presigned URL for debugging (can be removed later)
            System.out.println("[MinioService] raw presigned url: " + presigned);

            // If the presigned URL contains the internal URL string, do a direct replacement.
            if (presigned.contains(internalUrl)) {
                return presigned.replace(internalUrl, externalUrl);
            }

            // Otherwise try a more robust replacement: replace host+port using URI parsing
            try {
                java.net.URI presignedUri = new java.net.URI(presigned);
                java.net.URI externalUri = new java.net.URI(externalUrl);

                String newScheme = externalUri.getScheme() != null ? externalUri.getScheme() : presignedUri.getScheme();
                String newHost = externalUri.getHost() != null ? externalUri.getHost() : presignedUri.getHost();
                int newPort = externalUri.getPort() != -1 ? externalUri.getPort() : presignedUri.getPort();

                java.net.URI rebuilt = new java.net.URI(
                        newScheme,
                        null,
                        newHost,
                        newPort,
                        presignedUri.getRawPath(),
                        presignedUri.getRawQuery(),
                        presignedUri.getRawFragment()
                );

                String rebuiltStr = rebuilt.toString();
                System.out.println("[MinioService] rewritten presigned url: " + rebuiltStr);
                return rebuiltStr;
            } catch (Exception e2) {
                // Fallback to returning original presigned (we already logged it)
                e2.printStackTrace();
                return presigned;
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot generate presigned link");
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
