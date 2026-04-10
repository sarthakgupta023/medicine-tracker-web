package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@Component
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User saveUser(User user) {
        user.setEmail(user.getEmail().toLowerCase().trim());
        user.setName(user.getName().trim());
        if (user.getPassword() != null)
            user.setPassword(user.getPassword().trim());
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User getUser(String id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<User> getall() {
        return userRepository.findAll();
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim());
    }

    public User updatePassword(String email, String newPassword) {
        Optional<User> temp = getUserByEmail(email);
        if (temp.isEmpty())
            return null;
        User user = temp.get();
        user.setPassword(newPassword.trim());
        return userRepository.save(user);
    }
}