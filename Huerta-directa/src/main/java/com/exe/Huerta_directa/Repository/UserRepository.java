package com.exe.Huerta_directa.Repository;

import com.exe.Huerta_directa.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    User findByname(String name);

    User findById(long id);

    Optional<User> findByEmail(String email);

    // Buscar usuarios por ID de rol
    List<User> findByRole_IdRole(Long idRole);

    List<User> findByEmailIn(List<String> emails);

    List<User> findByRoleName(String roleName);

   // List<User> findByPhone(List<String> phones);



}
