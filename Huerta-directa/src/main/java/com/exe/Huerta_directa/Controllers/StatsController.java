package com.exe.Huerta_directa.Controllers;

import com.exe.Huerta_directa.DTO.StatsDTO;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Service.StatsService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/dashboard/admin")
    public ResponseEntity<StatsDTO> getAdminDashboardStats(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null || user.getRole() == null || user.getRole().getIdRole() == null || user.getRole().getIdRole() != 1L) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(statsService.getAdminStats());
    }

    @GetMapping("/dashboard/client")
    public ResponseEntity<StatsDTO> getClientDashboardStats(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(statsService.getClientStats(user.getId()));
    }
}
