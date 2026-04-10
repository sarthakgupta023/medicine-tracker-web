package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.demo.entity.Schedule;
import com.example.demo.repository.ScheduleRepository;

@Component
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    public Schedule saveOrUpdate(Schedule schedule) {
        Schedule existing = scheduleRepository.findByMedicineId(schedule.getMedicineId());
        if (existing != null) {
            scheduleRepository.deleteByMedicineId(schedule.getMedicineId());
        }
        return scheduleRepository.save(schedule);
    }

    public Schedule getByMedicineId(String medicineId) {
        return scheduleRepository.findByMedicineId(medicineId);
    }

    public List<Schedule> getByUserId(String userId) {
        return scheduleRepository.findByUserId(userId);
    }

    public void deleteByMedicineId(String medicineId) {
        scheduleRepository.deleteByMedicineId(medicineId);
    }
}