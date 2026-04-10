package com.example.demo.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "medicines")
public class Medicine {

    @Id
    private String id;

    private String userId;
    private String name;
    private int quantity;
    private LocalDate startDate;
    private LocalDate endDate;
    private int durationDays;
    private boolean active;
    private LocalDateTime createdAt;
}