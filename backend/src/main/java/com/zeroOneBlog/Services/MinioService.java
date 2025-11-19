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
import io.minio.http.Method;


@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    @Value("${minio.url}")
    private String minioUrl;

    @Value("${minio.url.internal}")
    private String internalUrl;

    @Value("${minio.url.external}")
    private String externalUrl;

    public String uploadFile(MinioBucketTypes bucketType, MultipartFile file) {
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

            return presigned.replace(internalUrl, externalUrl);

        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot generate presigned link");
        }
    }
}
