package com.exe.Huerta_directa.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table (name = "roles")
@Data
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "id_rol", nullable = false, unique = true, updatable = false)
    private Long idRole;

    @Column (name = "rol_name", nullable = false, length = 100)
    private String name;
    @JsonIgnore
    @OneToMany (mappedBy = "role", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<User> users;
}
