package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Logs;
import com.example.demo.service.LogsService;

@RestController
@RequestMapping("/logs")
public class LogsController {

    @Autowired
    private LogsService logsService;

    @GetMapping("/{userId}/{date}")
    public List<Logs> getByUserAndDate(@PathVariable String userId,
            @PathVariable String date) {
        return logsService.get_by_id_date(userId, date);
    }

    @PostMapping("/taken")
    public Logs save(@RequestBody Logs log) {
        return logsService.save(log);
    }
}