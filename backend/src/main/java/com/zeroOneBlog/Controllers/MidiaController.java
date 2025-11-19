package com.zeroOneBlog.Controllers;

import java.net.URI;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zeroOneBlog.Services.MinioService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MidiaController {
    final MinioService minioService;

    @GetMapping("/{bucket}/{objectName}")
    public ResponseEntity<Void> getMedia(@PathVariable String bucket,
            @PathVariable String objectName) {
        String url = minioService.getPresignedUrl(bucket+"/"+objectName);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(url))
                .build();
    }
}
