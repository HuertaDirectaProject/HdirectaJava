package com.exe.Huerta_directa.Services;

import com.exe.Huerta_directa.DTO.ProductDTO;
import java.util.List;

public interface FavoriteService {
    void addFavorite(Long userId, Long productId);
    void removeFavorite(Long userId, Long productId);
    List<ProductDTO> getFavorites(Long userId);
}
