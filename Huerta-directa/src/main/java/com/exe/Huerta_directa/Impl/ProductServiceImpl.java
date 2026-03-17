package com.exe.Huerta_directa.Impl;

import com.exe.Huerta_directa.DTO.ProductDTO;
import com.exe.Huerta_directa.DTO.CommentDTO;
import com.exe.Huerta_directa.Entity.Product;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Repository.ProductRepository;
import com.exe.Huerta_directa.Repository.UserRepository;
import com.exe.Huerta_directa.Service.ProductService;
import com.exe.Huerta_directa.Service.CommentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CommentService commentService;

    public ProductServiceImpl(ProductRepository productRepository, UserRepository userRepository,
            CommentService commentService) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.commentService = commentService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> listarProducts() {
        return productRepository.findAllWithUsers()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> listarProductosPorUsuario(Long userID) {
        return productRepository.findByUserId(userID)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO obtenerProductPorId(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + productId));
        ProductDTO productDTO = convertirADTO(product);
        enrichProductsWithRatings(Collections.singletonList(productDTO));
        return productDTO;
    }

    @Override
    public ProductDTO crearProduct(ProductDTO productDTO, Long userId) {
        // Buscar el usuario
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + userId));

        Product product = convertirAEntity(productDTO);
        product.setUser(user); // Asignar el usuario al producto

        Product nuevoProduct = productRepository.save(product);
        return convertirADTO(nuevoProduct);
    }

    @Override
    public ProductDTO actualizarProduct(Long productId, ProductDTO productDTO) {
        Product productExistente = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + productId));

        actualizarDatosProducto(productExistente, productDTO);
        Product productActualizado = productRepository.save(productExistente);
        return convertirADTO(productActualizado);
    }

    @Override
    @Transactional
    public void eliminarProductPorId(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Producto no encontrado con id: " + productId);
        } else {
            productRepository.deleteFromUserFavorites(productId);
            productRepository.deleteById(productId);
        }
    }

    @Override
    public List<ProductDTO> buscarPorNombre(String nombre) {
        return productRepository.findByNameProductContainingIgnoreCase(nombre).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> buscarPorCategoria(String categoria) {
        return productRepository.findByCategoryIgnoreCase(categoria).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existeProducto(String nombre, String categoria) {
        return productRepository.existsByNameProductIgnoreCaseAndCategoryIgnoreCase(nombre, categoria);
    }

    @Override
    public long contarTotalProductos() {
        return productRepository.count();
    }

    @Override
    public boolean existeProductoPorUsuario(String nombre, String categoria, Long userId) {
        try {
            List<Product> productos = productRepository.findAll();
            return productos.stream()
                    .anyMatch(p -> p.getNameProduct().trim().equalsIgnoreCase(nombre.trim()) &&
                            p.getCategory().trim().equalsIgnoreCase(categoria.trim()) &&
                            p.getUser() != null &&
                            p.getUser().getId().equals(userId));
        } catch (Exception e) {
            return false;
        }

    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> listarProductsPorCategoria(String slug) {
        return productRepository.findByCategorySlug(slug)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Convertir Entity a DTO
    private ProductDTO convertirADTO(Product product) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setIdProduct(product.getIdProduct());
        productDTO.setNameProduct(product.getNameProduct());
        productDTO.setPrice(product.getPrice());
        productDTO.setCategory(product.getCategory());
        productDTO.setImageProduct(product.getImageProduct());
        productDTO.setUnit(product.getUnit());
        productDTO.setDescriptionProduct(product.getDescriptionProduct());
        productDTO.setPublicationDate(product.getPublicationDate());
        productDTO.setStock(product.getStock());
        productDTO.setDiscountOffer(product.getDiscountOffer() != null ? product.getDiscountOffer() : 0);

        // Map images
        if (product.getImages() != null) {
            productDTO.setImages(product.getImages().stream()
                    .map(com.exe.Huerta_directa.Entity.ProductImage::getImageUrl)
                    .collect(Collectors.toList()));
        }

        // Asignar el id del usuario si existe
        if (product.getUser() != null) {
            try {
                // PRIMERO asignamos los datos planos
                productDTO.setUserId(product.getUser().getId());

                // Intentamos obtener el nombre (esto dispara el fetch lazy)
                String nombreUsuario = product.getUser().getName();

                // DEBUG LOGGING
                System.out.println("DEBUG PROD ID: " + product.getIdProduct() + " - User ID: "
                        + product.getUser().getId() + " - Name found: '" + nombreUsuario + "'");

                if (nombreUsuario == null || nombreUsuario.trim().isEmpty()) {
                    // Si no tiene nombre, intentamos usar el EMAIL
                    String emailUsuario = product.getUser().getEmail();
                    if (emailUsuario != null && !emailUsuario.trim().isEmpty()) {
                        productDTO.setUserName(emailUsuario);
                        nombreUsuario = emailUsuario; // Para el UserDTO
                    } else {
                        // Si no tiene email, usamos el ID
                        String idString = "ID: " + product.getUser().getId();
                        productDTO.setUserName(idString);
                        nombreUsuario = idString;
                    }
                } else {
                    productDTO.setUserName(nombreUsuario);
                }

                // Crear UserDTO básico con la información necesaria
                com.exe.Huerta_directa.DTO.UserDTO userDTO = new com.exe.Huerta_directa.DTO.UserDTO();
                userDTO.setId(product.getUser().getId());
                userDTO.setName(nombreUsuario);
                userDTO.setEmail(product.getUser().getEmail());
                productDTO.setUser(userDTO);

            } catch (Exception e) {
                // Fallback en caso de error de lazy loading u otro
                System.err.println("Error al cargar datos del usuario para producto " + product.getIdProduct() + ": "
                        + e.getMessage());
                productDTO.setUserName("Error cargando usuario");
                // Aseguramos que el userDTO no sea null para evitar null pointer en vista
                com.exe.Huerta_directa.DTO.UserDTO fallbackUser = new com.exe.Huerta_directa.DTO.UserDTO();
                fallbackUser.setId(product.getUser().getId()); // ID suele estar disponible sin fetch
                fallbackUser.setName("Desconocido");
                productDTO.setUser(fallbackUser);
            }
        } else {
            productDTO.setUserId(null);
            productDTO.setUserName("Sin Usuario Asignado");
        }

        return productDTO;
    }

    // Convertir DTO a Entity
    private Product convertirAEntity(ProductDTO productDTO) {
        Product product = new Product();
        product.setIdProduct(productDTO.getIdProduct());
        product.setNameProduct(productDTO.getNameProduct());
        product.setPrice(productDTO.getPrice());
        product.setCategory(productDTO.getCategory());
        product.setImageProduct(productDTO.getImageProduct());
        product.setUnit(productDTO.getUnit());
        product.setDescriptionProduct(productDTO.getDescriptionProduct());
        product.setPublicationDate(productDTO.getPublicationDate());
        product.setStock(productDTO.getStock());
        product.setDiscountOffer(productDTO.getDiscountOffer() != null ? productDTO.getDiscountOffer() : 0);

        if (productDTO.getUserId() != null) {
            User user = userRepository.findById(productDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + productDTO.getUserId()));
            product.setUser(user);
        }

        return product;
    }

    // Actualizar Entity con datos del DTO
    private void actualizarDatosProducto(Product product, ProductDTO productDTO) {
        product.setNameProduct(productDTO.getNameProduct());
        product.setPrice(productDTO.getPrice());
        product.setCategory(productDTO.getCategory());
        product.setImageProduct(productDTO.getImageProduct());
        product.setUnit(productDTO.getUnit());
        product.setDescriptionProduct(productDTO.getDescriptionProduct());
        product.setPublicationDate(productDTO.getPublicationDate());
        product.setStock(productDTO.getStock());
        product.setDiscountOffer(productDTO.getDiscountOffer() != null ? productDTO.getDiscountOffer() : 0);

        if (productDTO.getUserId() != null) {
            User user = userRepository.findById(productDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + productDTO.getUserId()));
            product.setUser(user);
        }
    }

    // La implementacion para los graficos por categoria
    @Override
    public Map<String, Long> contarProductosPorCategoria() {
        return listarProducts().stream()
                .collect(Collectors.groupingBy(ProductDTO::getCategory, Collectors.counting()));
    }

    @Override
    @Transactional
    public void descontarStock(Long productId, Integer cantidad) {
        Product producto = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productId));

        // Validar que hay stock suficiente
        if (producto.getStock() == null) {
            throw new RuntimeException("El producto '" + producto.getNameProduct() + "' no tiene stock configurado");
        }

        if (producto.getStock() < cantidad) {
            throw new RuntimeException("Stock insuficiente para '" + producto.getNameProduct() +
                    "'. Disponible: " + producto.getStock() +
                    ", Solicitado: " + cantidad);
        }

        // Descontar stock
        producto.setStock(producto.getStock() - cantidad);
        productRepository.save(producto);

        // Eliminar esto despues de probar
        // Logging mejorado (más fácil de leer en consola)
        System.out.println("✅ Stock actualizado:");
        System.out.println("   - Producto: " + producto.getNameProduct());
        System.out.println("   - Cantidad descontada: " + cantidad);
        System.out.println("   - Stock restante: " + producto.getStock());
    }

    @Override
    @Transactional
    public void agregarImagen(Long productId, String imageUrl) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        com.exe.Huerta_directa.Entity.ProductImage image = new com.exe.Huerta_directa.Entity.ProductImage(imageUrl,
                product);

        // Al usar CascadeType.ALL y añadir a la lista, debería guardarse al guardar el
        // producto
        product.getImages().add(image);
        productRepository.save(product);
    }

    @Override
    public void enrichProductsWithRatings(List<ProductDTO> products) {
        for (ProductDTO product : products) {
            try {
                // Get comments for this product
                List<CommentDTO> comments = commentService.listarCommentsPorProducto(product.getIdProduct());

                // Calculate average rating and count
                double averageRating = 0.0;
                int ratingCount = 0;

                for (CommentDTO comment : comments) {
                    if (comment.getRating() != null) {
                        averageRating += comment.getRating();
                        ratingCount++;
                    }
                }

                if (ratingCount > 0) {
                    averageRating = averageRating / ratingCount;
                }

                // Set the values in the product DTO
                product.setAverageRating(averageRating);
                product.setReviewCount(comments.size()); // Total number of reviews (comments)

            } catch (Exception e) {
                // If there's an error, set default values
                System.err.println(
                        "Error calculating ratings for product " + product.getIdProduct() + ": " + e.getMessage());
                product.setAverageRating(0.0);
                product.setReviewCount(0);
            }
        }
    }

}
