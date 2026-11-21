package com.fixmatelk.backend.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum BookingStatus {
    PENDING("Pending"),
    ACCEPTED("Accepted"),
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled"),
    DECLINED("Declined");

    private final String displayName;

    BookingStatus(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static BookingStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Booking status cannot be blank");
        }
        String normalized = value.trim().toUpperCase().replace(" ", "_");
        return BookingStatus.valueOf(normalized);
    }
}
