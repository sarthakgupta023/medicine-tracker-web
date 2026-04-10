package com.example.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "logs")
public class Logs {

    @Id
    private String id;

    private String userId;
    private String medicineId;
    private String takenDate; // "YYYY-MM-DD"
    private String timing; // e.g. "Before Breakfast"
}