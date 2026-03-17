package com.exe.Huerta_directa.Entity;

import jakarta.persistence.*;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true, updatable = false)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    @NotBlank
    @Size(max = 100)
    private String name;

    @Column(name = "email", nullable = false, length = 250, unique = true)
    @NotBlank
    @Size(max = 250)
    private String email;

    @Column(name = "password", nullable = false, length = 250)
    @NotBlank
    @Size(max = 250)
    private String password;

    @Column(name = "phone", length = 15)
    @Size(max = 15)
    private String phone;

    @Column(name = "address", length = 250)
    @Size(max = 250)
    private String address;

    @Column(name = "creacion_date", nullable = false)
    private LocalDate creacionDate;

    // NUEVOS CAMPOS
    @Column(name = "gender", length = 1)
    private String gender; // "M" = Masculino, "F" = Femenino, "O" = Otro, null = No especificado

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Set<Product> products;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_favorites",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Set<Product> favoriteProducts = new java.util.HashSet<>();

    // Metodo para calcular la edad
    public Integer getAge() {
        if (birthDate == null) {
            return null;
        }
        return LocalDate.now().getYear() - birthDate.getYear();
    }

    // Metodo para obtener rango de edad
    public String getAgeRange() {
        Integer age = getAge();
        if (age == null)
            return "No especificado";

        if (age <= 25)
            return "18-25";
        if (age <= 35)
            return "26-35";
        if (age <= 45)
            return "36-45";
        if (age <= 55)
            return "46-55";
        return "56+";
    }
}