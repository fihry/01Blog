package com.zeroOneBlog.Controllers;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeroOneBlog.Services.MinioService;

import io.minio.StatObjectResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MinioService minioService;

    @GetMapping("/{bucket}/{object:.+}")
    public ResponseEntity<InputStreamResource> streamMedia(@PathVariable String bucket, @PathVariable String object) {
        InputStream stream = minioService.getObjectStream(bucket, object);
        StatObjectResponse stat = minioService.getObjectStat(bucket, object);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(stat.contentType()))
                .contentLength(stat.size())
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS))
                .body(new InputStreamResource(stream));
    }
}
