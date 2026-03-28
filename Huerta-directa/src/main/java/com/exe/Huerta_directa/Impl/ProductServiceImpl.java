package com.exe.Huerta_directa.Impl;

import com.exe.Huerta_directa.DTO.CarritoItem;
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
    private final com.exe.Huerta_directa.Service.NotificationService notificationService;

    public ProductServiceImpl(ProductRepository productRepository, UserRepository userRepository,
            CommentService commentService, com.exe.Huerta_directa.Service.NotificationService notificationService) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.commentService = commentService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> listarProducts() {
        List<ProductDTO> products = productRepository.findAllWithUsers()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
        enrichProductsWithRatings(products);
        return products;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> listarProductsAprobados() {
        List<ProductDTO> products = productRepository.findAllWithUsers()
                .stream()
                .filter(p -> p.getStatus() == com.exe.Huerta_directa.Entity.ProductStatus.APPROVED)
                .map(this::convertirADTO)
                .collect(Collectors.toList());
        enrichProductsWithRatings(products);
        return products;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> listarProductosPorUsuario(Long userID) {
        List<ProductDTO> products = productRepository.findByUserId(userID)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
        enrichProductsWithRatings(products);
        return products;
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
    @Transactional
    public ProductDTO crearProduct(ProductDTO productDTO, Long userId) {
        // Buscar el usuario
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + userId));

        Product product = convertirAEntity(productDTO);
        
        // Asegurar que el estado sea PENDING si no viene especificado
        if (product.getStatus() == null) {
            product.setStatus(com.exe.Huerta_directa.Entity.ProductStatus.PENDING);
        }
        
        product.setUser(user); // Asignar el usuario al producto

        Product nuevoProduct = productRepository.save(product);
        
        // Notificar a los administradores (Envolvió en try-catch para evitar que falle la creación del producto)
        try {
            // Buscamos administradores por ID (1L) o por Nombre ("Administrador")
            java.util.Set<User> admins = new java.util.HashSet<>();
            
            // Intento 1: Por ID de Rol (ID 1 suele ser Administrador)
            admins.addAll(userRepository.findByRole_IdRole(1L));
            
            // Intento 2: Por nombre de Rol (Respaldo por si el ID es diferente)
            admins.addAll(userRepository.findByRoleName("Administrador"));
            
            if (!admins.isEmpty()) {
                System.out.println("DEBUG: Notificando a " + admins.size() + " administradores.");
                for (User admin : admins) {
                    notificationService.createNotification(admin.getId(), 
                        "Nuevo producto pendiente de aprobación: " + nuevoProduct.getNameProduct());
                }
            } else {
                System.out.println("DEBUG: No se encontraron administradores para notificar (ID 1 o nombre 'Administrador')");
            }
        } catch (Exception e) {
            // Loguear el error pero permitir que el producto se considere creado
            System.err.println("Error al enviar notificaciones a los admins: " + e.getMessage());
            e.printStackTrace();
        }

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
    public ProductDTO actualizarStatus(Long productId, com.exe.Huerta_directa.Entity.ProductStatus status) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + productId));
        product.setStatus(status);
        Product actualizado = productRepository.save(product);
        return convertirADTO(actualizado);
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
        List<ProductDTO> products = productRepository.findByNameProductContainingIgnoreCase(nombre).stream()
                .filter(p -> p.getStatus() == com.exe.Huerta_directa.Entity.ProductStatus.APPROVED)
                .map(this::convertirADTO)
                .collect(Collectors.toList());
        enrichProductsWithRatings(products);
        return products;
    }

    @Override
    public List<ProductDTO> buscarPorCategoria(String categoria) {
        List<ProductDTO> products = productRepository.findByCategoryIgnoreCase(categoria).stream()
                .filter(p -> p.getStatus() == com.exe.Huerta_directa.Entity.ProductStatus.APPROVED)
                .map(this::convertirADTO)
                .collect(Collectors.toList());
        enrichProductsWithRatings(products);
        return products;
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
        return productRepository
                .existsByNameProductIgnoreCaseAndCategoryIgnoreCaseAndUserId(nombre, categoria, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> listarProductsPorCategoria(String slug) {
        List<ProductDTO> products = productRepository.findByCategorySlug(slug)
                .stream()
                .filter(p -> p.getStatus() == com.exe.Huerta_directa.Entity.ProductStatus.APPROVED)
                .map(this::convertirADTO)
                .collect(Collectors.toList());
        enrichProductsWithRatings(products);
        return products;
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
        productDTO.setStatus(product.getStatus());

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
        if (productDTO.getStatus() != null) {
            product.setStatus(productDTO.getStatus());
        }

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
        if (productDTO.getStatus() != null) {
            product.setStatus(productDTO.getStatus());
        }

        if (productDTO.getUserId() != null) {
            User user = userRepository.findById(productDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + productDTO.getUserId()));
            product.setUser(user);
        }
    }

    // La implementacion para los graficos por categoria
    @Override
    public Map<String, Long> contarProductosPorCategoria() {
        return productRepository.countByCategory()
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
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

    }

    @Override
    @Transactional(readOnly = true)
    public void validarStockCarrito(List<CarritoItem> carrito) {
        if (carrito == null || carrito.isEmpty()) {
            throw new RuntimeException("El carrito esta vacio");
        }

        for (CarritoItem item : carrito) {
            if (item == null || item.getProductId() == null) {
                throw new RuntimeException("Hay productos invalidos en el carrito");
            }

            Integer cantidad = item.getCantidad();
            if (cantidad == null || cantidad <= 0) {
                throw new RuntimeException("Cantidad invalida para el producto: " + item.getNombre());
            }

            Product producto = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + item.getProductId()));

            if (producto.getStock() == null) {
                throw new RuntimeException("El producto '" + producto.getNameProduct() + "' no tiene stock configurado");
            }

            if (producto.getStock() < cantidad) {
                throw new RuntimeException("Stock insuficiente para '" + producto.getNameProduct() +
                        "'. Disponible: " + producto.getStock() +
                        ", Solicitado: " + cantidad);
            }
        }
    }

    @Override
    @Transactional
    public void descontarStockCarrito(List<CarritoItem> carrito) {
        validarStockCarrito(carrito);

        for (CarritoItem item : carrito) {
            Product producto = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + item.getProductId()));

            int nuevoStock = producto.getStock() - item.getCantidad();
            producto.setStock(nuevoStock);
            productRepository.save(producto);
        }
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

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> listarOfertas() {
        // Usamos findAllWithUsers para asegurar que tenemos toda la info necesaria
        List<ProductDTO> products = productRepository.findAllWithUsers().stream()
                .filter(p -> p.getStatus() == com.exe.Huerta_directa.Entity.ProductStatus.APPROVED)
                .filter(p -> p.getDiscountOffer() != null && p.getDiscountOffer() >= 1)
                .map(this::convertirADTO)
                .collect(Collectors.toList());
        enrichProductsWithRatings(products);
        return products;
    }

}
