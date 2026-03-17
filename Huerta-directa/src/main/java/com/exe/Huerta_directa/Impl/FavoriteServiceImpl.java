package com.exe.Huerta_directa.Impl;

import com.exe.Huerta_directa.DTO.ProductDTO;
import com.exe.Huerta_directa.Entity.Product;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Repository.ProductRepository;
import com.exe.Huerta_directa.Repository.UserRepository;
import com.exe.Huerta_directa.Services.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteServiceImpl implements FavoriteService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    @Transactional
    public void addFavorite(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productId));

        user.getFavoriteProducts().add(product);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void removeFavorite(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productId));

        user.getFavoriteProducts().remove(product);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getFavorites(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));

        return user.getFavoriteProducts().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private ProductDTO mapToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setIdProduct(product.getIdProduct());
        dto.setNameProduct(product.getNameProduct());
        dto.setPrice(product.getPrice());
        dto.setCategory(product.getCategory());
        dto.setImageProduct(product.getImageProduct());
        dto.setStock(product.getStock());
        dto.setUnit(product.getUnit());
        dto.setDescriptionProduct(product.getDescriptionProduct());
        if (product.getUser() != null) {
            dto.setUserName(product.getUser().getName());
        }
        return dto;
    }
}
