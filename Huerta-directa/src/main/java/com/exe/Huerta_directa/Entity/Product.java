package com.exe.Huerta_directa.Entity;

import jakarta.persistence.*;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "products")
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_product", nullable = false, unique = true, updatable = false)
    private Long idProduct;

    @Column(name = "name_product", nullable = false, length = 50)
    @NotBlank
    @Size(max = 50)
    private String nameProduct = "sin nombre";

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "category", nullable = false, length = 100)
    @NotBlank
    @Size(max = 100)
    private String category;

    @Column(name = "category_slug", length = 120)
    private String categorySlug;

    @Column(name = "image_product", nullable = false, length = 250)
    @NotBlank
    @Size(max = 250)
    private String imageProduct = "sin nombre";

    @Column(name = "stock", length = 100)
    private Integer stock;

    @Column(name = "unit", nullable = false, length = 250)
    @NotBlank
    @Size(max = 250)
    private String unit = "Campo no rellenado";

    @Column(name = "publication_date", nullable = false)
    private LocalDate publicationDate = LocalDate.now();

    @Column(name = "description_product", nullable = false, columnDefinition = "TEXT")
    @NotBlank
    private String descriptionProduct = "sin descripcion";

    @Column(name = "discount_offer")
    private Integer discountOffer = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "products" })
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private User user;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("product")
    private java.util.List<ProductImage> images = new java.util.ArrayList<>();

    @PrePersist
    @PreUpdate
    private void generateCategorySlug() {
        if (this.category != null) {
            this.categorySlug = this.category
                    .toLowerCase()
                    .trim()
                    .replace(" ", "-");
        }
    }
}
