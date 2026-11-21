package com.fixmatelk.backend.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum QuoteStatus {
    NONE("None"),
    PENDING("Pending"),
    APPROVED("Approved"),
    REJECTED("Rejected");

    private final String displayName;

    QuoteStatus(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static QuoteStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return NONE;
        }
        return QuoteStatus.valueOf(value.trim().toUpperCase());
    }
}
