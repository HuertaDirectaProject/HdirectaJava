package com.exe.Huerta_directa.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ProductDTO {

    private Long idProduct;
    private String nameProduct;
    private BigDecimal price;
    private String category;
    private String imageProduct;
    private String unit;
    private LocalDate publicationDate;
    private String descriptionProduct;
    private Long userId;
    private String etiqueta;
    private String userName;
    private Integer stock;
    private Integer discountOffer;
    private java.util.List<String> images;

    private UserDTO user;

    // Rating fields for product cards
    private Double averageRating;
    private Integer reviewCount;

}
