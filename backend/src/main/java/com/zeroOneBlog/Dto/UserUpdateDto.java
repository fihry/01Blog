package com.zeroOneBlog.Dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDto {
    @Size(max = 255, message = "Bio must not exceed 255 characters")
    private String bio;
    private MultipartFile avatar;
}
