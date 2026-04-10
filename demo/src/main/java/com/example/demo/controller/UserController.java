package com.example.demo.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.User;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // ── Signup
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            if (user.getEmail() == null || user.getEmail().isBlank())
                return ResponseEntity.badRequest().body("Email is required");
            if (user.getName() == null || user.getName().isBlank())
                return ResponseEntity.badRequest().body("Name is required");
            if (user.getPassword() == null || user.getPassword().isBlank())
                return ResponseEntity.badRequest().body("Password is required");

            Optional<User> already = userService.getUserByEmail(user.getEmail());
            if (already.isPresent())
                return ResponseEntity.badRequest().body("false");

            userService.saveUser(user);
            return ResponseEntity.ok("true");

        } catch (DuplicateKeyException e) {
            return ResponseEntity.badRequest().body("false");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Signup failed: " + e.getMessage());
        }
    }

    // ── Login — returns real JWT now
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            if (user.getEmail() == null || user.getEmail().isBlank())
                return ResponseEntity.badRequest().body("Email is required");

            Optional<User> temp = userService.getUserByEmail(user.getEmail());
            if (temp.isEmpty())
                return ResponseEntity.status(404).body("User doesn't exist");

            User actual = temp.get();

            // Skip password check for Google OAuth users
            if ("GOOGLE_OAUTH2".equals(actual.getPassword()))
                return ResponseEntity.status(401).body("Please sign in with Google");

            if (!actual.getPassword().equals(user.getPassword()))
                return ResponseEntity.status(401).body("Wrong credentials");

            // Generate real JWT
            String token = jwtUtil.generateToken(actual.getId(), actual.getEmail());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", token,
                    "userId", actual.getId(),
                    "email", actual.getEmail(),
                    "message", "Login successful"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Login failed: " + e.getMessage());
        }
    }

    // ── Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id) {
        User user = userService.getUser(id);
        if (user == null)
            return ResponseEntity.status(404).body("User not found");
        return ResponseEntity.ok(user);
    }

    // ── Get all users
    @GetMapping("/getall")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(userService.getall());
    }

    // ── Update password
    @PutMapping("/updatePassword")
    public ResponseEntity<?> updatePassword(@RequestParam String email,
            @RequestParam String newPassword) {
        try {
            User updated = userService.updatePassword(email, newPassword);
            if (updated == null)
                return ResponseEntity.status(404).body("User not found");
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Update failed: " + e.getMessage());
        }
    }
}