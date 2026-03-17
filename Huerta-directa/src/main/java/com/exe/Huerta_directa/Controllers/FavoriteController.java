package com.exe.Huerta_directa.Controllers;

import com.exe.Huerta_directa.DTO.ProductDTO;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Services.FavoriteService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @PostMapping("/{productId}")
    public ResponseEntity<String> addFavorite(@PathVariable Long productId, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Debe iniciar sesión para agregar a favoritos");
        }
        try {
            favoriteService.addFavorite(user.getId(), productId);
            return ResponseEntity.ok("Producto agregado a favoritos");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al agregar a favoritos: " + e.getMessage());
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<String> removeFavorite(@PathVariable Long productId, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Debe iniciar sesión para eliminar de favoritos");
        }
        try {
            favoriteService.removeFavorite(user.getId(), productId);
            return ResponseEntity.ok("Producto eliminado de favoritos");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar de favoritos: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getFavorites(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Debe iniciar sesión para ver sus favoritos");
        }
        try {
            List<ProductDTO> favorites = favoriteService.getFavorites(user.getId());
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al obtener favoritos: " + e.getMessage());
        }
    }
}
