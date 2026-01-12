package com.zeroOneBlog.Dto;

import java.util.UUID;

import com.zeroOneBlog.Types.MediaType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaDto {
    private UUID id;
    private String mediaUrl;
    private MediaType mediaType; // IMAGES, VIDEOS, or AUDIOS
}
