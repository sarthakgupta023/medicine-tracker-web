package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.demo.entity.Medicine;
import com.example.demo.repository.MedicineRepository;

@Component
public class MedicineService {

    @Autowired
    private MedicineRepository medicineRepository;

    public List<Medicine> getall(String userId) {
        return medicineRepository.findByUserId(userId);
    }

    public List<Medicine> get() {
        return medicineRepository.findAll();
    }

    public Optional<Medicine> getByMedicineId(String id) {
        return medicineRepository.findById(id);
    }

    public Medicine addMedicine(Medicine medicine) {
        medicine.setCreatedAt(LocalDateTime.now());
        medicine.setActive(true);
        if (medicine.getStartDate() != null && medicine.getDurationDays() > 0) {
            medicine.setEndDate(medicine.getStartDate().plusDays(medicine.getDurationDays()));
        }
        return medicineRepository.save(medicine);
    }

    public Medicine updateMedicine(String id, Medicine medicine) {
        Optional<Medicine> existing = getByMedicineId(id);
        if (existing.isEmpty())
            return null;
        Medicine old = existing.get();
        old.setQuantity(medicine.getQuantity());
        return medicineRepository.save(old);
    }

    public void deleteMedicine(String id) {
        medicineRepository.deleteById(id);
    }
}