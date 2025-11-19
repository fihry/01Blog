package com.zeroOneBlog.Dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostCreateDto {

    @NotBlank(message = "Title cannot be empty")
    @Size(min = 10, max = 100, message = "Title must be between 10 and 100 characters")
    private String title;

    @NotBlank(message = "Content cannot be empty")
    @Size(min = 100, max = 10000, message = "Content must be between 100 and 10000 characters")
    private String content;

    private MultipartFile media;
}
