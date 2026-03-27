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

    List<Product> findByUserId(Long userId);

    List<Product> findByNameProductContainingIgnoreCase(String nameProduct);

    List<Product> findByCategoryIgnoreCase(String category);

    List<Product> findByCategorySlug(String categorySlug);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.user WHERE p.discountOffer >= 1")
    List<Product> findByDiscountOfferGreaterThanZero();

    boolean existsByNameProductIgnoreCaseAndCategoryIgnoreCase(String nameProduct, String category);

    // FIX 1: reemplaza el findAll() en existeProductoPorUsuario
    boolean existsByNameProductIgnoreCaseAndCategoryIgnoreCaseAndUserId(
            String nombre, String categoria, Long userId);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.user")
    List<Product> findAllWithUsers();

    // FIX 4: query directa para contarProductosPorCategoria
    @Query("SELECT p.category, COUNT(p) FROM Product p GROUP BY p.category")
    List<Object[]> countByCategory();

    @SuppressWarnings("JpaQueryApiInspection")
    @Modifying
    @Query(value = "DELETE FROM user_favorites WHERE product_id = :productId", nativeQuery = true)
    void deleteFromUserFavorites(@Param("productId") Long productId);
}