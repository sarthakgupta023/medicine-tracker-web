package com.example.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.entity.Logs;

public interface LogsRepository extends MongoRepository<Logs, String> {
    List<Logs> findByUserIdAndTakenDate(String userId, String takenDate);
}