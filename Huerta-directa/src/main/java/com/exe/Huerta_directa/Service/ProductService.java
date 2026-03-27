package com.exe.Huerta_directa.Service;

import com.exe.Huerta_directa.DTO.ProductDTO;

import java.util.List;
import java.util.Map;

public interface ProductService {

    List<ProductDTO> listarProducts();
    
    List<ProductDTO> listarProductsAprobados();

    List<ProductDTO> listarProductosPorUsuario(Long userID);

    ProductDTO obtenerProductPorId(Long productId);

    ProductDTO crearProduct(ProductDTO productDTO, Long userId);

    ProductDTO actualizarProduct(Long productId, ProductDTO productDTO);

    ProductDTO actualizarStatus(Long productId, com.exe.Huerta_directa.Entity.ProductStatus status);

    List<ProductDTO> listarProductsPorCategoria(String categoria);

    void eliminarProductPorId(Long productId);

    List<ProductDTO> buscarPorNombre(String nombre);

    List<ProductDTO> buscarPorCategoria(String categoria);

    boolean existeProducto(String nombre, String categoria);

    boolean existeProductoPorUsuario(String nombre, String Categoria, Long productId);

    long contarTotalProductos();

    // esto es para hacer los graficos por categorias
    Map<String, Long> contarProductosPorCategoria();

    void descontarStock(Long productId, Integer cantidad);

    void agregarImagen(Long productId, String imageUrl);

    // Enrich products with rating data (average rating and review count)
    void enrichProductsWithRatings(List<ProductDTO> products);

    List<ProductDTO> listarOfertas();
}
