package com.exe.Huerta_directa.DTO;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//import java.time.LocalDate;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String password;
    private String phone;
    private String address;
    private LocalDate creacionDate;
    private Long idRole;
    private String gender;
    private LocalDate birthDate;
    private String profileImageUrl;
    

}


