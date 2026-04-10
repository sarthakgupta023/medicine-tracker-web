package com.example.demo.entity;

import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "schedules")
public class Schedule {

    @Id
    private String id;

    private String userId;
    private String medicineId;

    // e.g. ["MONDAY", "WEDNESDAY", "FRIDAY"]
    private List<String> days;

    // Global times across all days
    private List<String> times;

    // Per-day times: { "MON": ["Before Breakfast", "After Dinner"], ... }
    private Map<String, List<String>> dayTimesMap;
}