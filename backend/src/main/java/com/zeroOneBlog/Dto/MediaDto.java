package com.zeroOneBlog.Dto;

import java.util.UUID;

import com.zeroOneBlog.Types.MinioBucketTypes;

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
    private MinioBucketTypes mediaType; // IMAGES, VIDEOS, or AUDIOS
}
