package com.fixmatelk.backend.dto;

import lombok.Data;

@Data
public class UpdateUserProfileRequest {
    private String name;
    private String phone;
    private String district;
    private String address;
    private String avatar;
}
