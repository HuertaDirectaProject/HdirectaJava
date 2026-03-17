package com.exe.Huerta_directa.Repository;

import com.exe.Huerta_directa.Entity.Product;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Product findBynameProduct(String nameProduct);

    // Metodo para buscar productos por el ID del usuario
    List<Product> findByUserId(Long userId);

    List<Product> findByNameProductContainingIgnoreCase(String nameProduct);

    List<Product> findByCategoryIgnoreCase(String category);
    // este es de prueba de react
    List<Product> findByCategorySlug(String categorySlug);

    // Método para verificar duplicados exactos
    boolean existsByNameProductIgnoreCaseAndCategoryIgnoreCase(String nameProduct, String category);

    // FETCH JOIN para traer usuarios eficientemente
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.user")
    List<Product> findAllWithUsers();

    @Modifying
    @Query(value = "DELETE FROM user_favorites WHERE product_id = :productId", nativeQuery = true)
    void deleteFromUserFavorites(@Param("productId") Long productId);
}