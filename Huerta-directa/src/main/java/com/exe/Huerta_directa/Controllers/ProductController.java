package com.exe.Huerta_directa.Controllers;

import com.exe.Huerta_directa.DTO.ProductDTO;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Repository.UserRepository;
import com.exe.Huerta_directa.Service.ProductService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    private final UserRepository userRepository;

    public ProductController(ProductService productService, UserRepository userRepository) {
        this.productService = productService;
        this.userRepository = userRepository;
    }

    @Value("${upload.path}")
    private String uploadPath;

    // Crear producto con imagen
    @PostMapping("/create")
    public ResponseEntity<?> crearProductConImagen(
            @RequestParam("nombre") String nameProduct,
            @RequestParam("precio") Double price,
            @RequestParam("unidad") String unit,
            @RequestParam("categoria-producto") String category,
            @RequestParam(value = "image_product", required = false) MultipartFile mainImage,
            @RequestParam(value = "additional_images", required = false) MultipartFile[] additionalImages,
            @RequestParam("descripcion") String descriptionProduct,
            @RequestParam(value = "stock", defaultValue = "0") Integer stock,
            HttpSession session) {
        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Debe iniciar sesión para registrar productos");
        }
        // Validar datos completos del usuario
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (user.getPhone() == null || user.getPhone().trim().isEmpty() ||
                user.getAddress() == null || user.getAddress().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Complete su teléfono y dirección en el perfil antes de agregar productos");
        }
        try {
            // Obtener usuario desde la sesiÃ³n
            User userSession = (User) session.getAttribute("user");
            if (userSession == null) {
                // Si no hay usuario en sesiÃ³n, agregar mensaje de alerta y redirigir al login
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Debe iniciar sesión para registrar productos");
            }
            // PERMITIR A CUALQUIER USUARIO REGISTRADO AGREGAR PRODUCTOS
            // (No solo admins, cualquier usuario autenticado puede agregar productos)
            // Crear carpeta /productos dentro de C:/HuertaUploads
            File uploadDir = new File(uploadPath, "productos");
            if (!uploadDir.exists()) {
                boolean created = uploadDir.mkdirs();
                if (!created) {
                    throw new IOException("No se pudo crear el directorio de uploads");
                }
            }
            String nombreImagen = "default.png";
            if (mainImage != null && !mainImage.isEmpty()) {
                String extension = Optional.ofNullable(mainImage.getOriginalFilename())
                        .filter(f -> f.contains("."))
                        .map(f -> f.substring(mainImage.getOriginalFilename().lastIndexOf(".")))
                        .orElse("");
                nombreImagen = UUID.randomUUID() + extension;
                File destino = new File(uploadDir, nombreImagen);
                mainImage.transferTo(destino);
            }
            ProductDTO productDTO = new ProductDTO();
            productDTO.setNameProduct(nameProduct);
            productDTO.setPrice(BigDecimal.valueOf(price));
            productDTO.setCategory(category);
            productDTO.setUnit(unit);
            productDTO.setDescriptionProduct(descriptionProduct);
            productDTO.setStock(stock);
            productDTO.setPublicationDate(LocalDate.now());
            productDTO.setUserId(userSession.getId()); // Usar ID del usuario de la sesión
            productDTO.setImageProduct(nombreImagen);

            ProductDTO creado = productService.crearProduct(productDTO, userSession.getId());

            // Guardar imágenes adicionales
            if (additionalImages != null && additionalImages.length > 0) {
                for (MultipartFile img : additionalImages) {
                    if (!img.isEmpty()) {
                        String ext = Optional.ofNullable(img.getOriginalFilename())
                                .filter(f -> f.contains("."))
                                .map(f -> f.substring(img.getOriginalFilename().lastIndexOf(".")))
                                .orElse("");
                        String imgName = UUID.randomUUID() + ext;
                        File dest = new File(uploadDir, imgName);
                        img.transferTo(dest);

                        // Aquí deberíamos guardar la entidad ProductImage.
                        // Como no tengo autowired del repositorio de imágenes aquí, necesito un
                        // servicio.
                        productService.agregarImagen(creado.getIdProduct(), imgName);
                    }
                }
            }
            if (creado != null && creado.getIdProduct() != null) {
                return ResponseEntity.ok(creado);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error al registrar el producto");
            }
        } catch (IOException | RuntimeException e) {
            // En caso de error -> volver al formulario con mensaje de error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno del servidor");
        }
    }

    // AquÃ­ irÃ­an los endpoints para manejar las solicitudes HTTP relacionadas con
    // producto
    @GetMapping
    public ResponseEntity<List<ProductDTO>> listarProducts() {
        return new ResponseEntity<>(productService.listarProducts(), HttpStatus.OK);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductDTO>> listarProductsPorCategoria(@PathVariable String category) {
        return new ResponseEntity<>(productService.listarProductsPorCategoria(category), HttpStatus.OK);
    }

    @GetMapping("/category/test")
    public String testCategory() {
        return "FUNCIONA CATEGORY";
    }

    // Metodo para obtener un producto por su id
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDTO> obtenerProductPorId(@PathVariable Long productId) {
        return new ResponseEntity<>(productService.obtenerProductPorId(productId), HttpStatus.OK);
    }

    /*
     *
     * @PostMapping
     * public ResponseEntity<ProductDTO> crearProduct(@RequestBody ProductDTO
     * productDTO) {
     * return new ResponseEntity<>(productService.crearProduct(productDTO),
     * HttpStatus.CREATED);
     * }
     */
    // Metodo para actualizar un producto
    @PutMapping("/{productId}")
    public ResponseEntity<ProductDTO> actualizarProduct(@PathVariable("productId") Long productId,
            @RequestBody ProductDTO productDTO) {
        return new ResponseEntity<>(productService.actualizarProduct(productId, productDTO), HttpStatus.OK);
    }

    // Metodo para eliminar un producto por su id
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> eliminarProductPorId(@PathVariable("productId") Long productId) {
        productService.eliminarProductPorId(productId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/mis-Productos")
    @ResponseBody
    public ResponseEntity<List<ProductDTO>> obtenerMisProductos(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        List<ProductDTO> productos = productService.listarProductosPorUsuario(user.getId());
        return ResponseEntity.ok(productos);
    }
}
