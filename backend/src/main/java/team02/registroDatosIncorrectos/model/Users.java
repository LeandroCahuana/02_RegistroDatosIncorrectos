package team02.registroDatosIncorrectos.model;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class Users {

    @Id
    @Column(value = "id")
    private Long id;

    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(max = 120, message = "El nombre del usuario no puede superar los 120 caracteres")
    @Column(value = "name")
    private String name;

    @NotBlank(message = "El tipo de documento es obligatorio")
    @Pattern(regexp = "^(DNI|CNE)$", message = "El tipo de documento solo admite 'DNI' o 'CNE'")
    @Column(value = "type_document")
    private String type_document;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(max = 12, message = "El número de documento no puede superar los 8 caracteres para DNI y los 12 caracteres para CNE")
    @Column(value = "number_document")
    private String number_document;

    @NotBlank(message = "El email es obligatorio")
    @Size(max = 120, message = "El email del usuario no puede superar los 120 caracteres")
    @Email(message = "El formato de correo no es válido")
    @Column(value = "email")
    private String email;

    @NotBlank(message = "El número de celular es obligatorio")
    @Size(max = 9, message = "El número de celular no puede superar los 9 dígitos")
    @Pattern(
            regexp = "^9[0-9]{8}$",
            message = "El número de celular debe empezar con el dígito 9 y contener solo números"
    )
    @Column(value = "cellphone")
    private String cellphone;

    @NotNull(message = "La edad del usuario es obligatoria")
    @Min(value = 18, message = "La edad mínima debe ser 18")
    @Column(value = "age")
    private Long age;

    @NotBlank(message = "El genero del usuario es obligatorio")
    @Pattern(regexp = "^[MF]$", message ="En el registro del genero debe ser: 'F' para femenino || 'M' para masculino")
    @Column(value = "gender")
    private String gender;

    @Size(min = 8, max = 120, message = "La contraseña debe tener entre 8 y 120 caracteres")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@_\\.;:-])[A-Za-z\\d@_\\.;:-]+$",
            message = "La contraseña debe incluir al menos una letra mayúscula, una minúscula, un número y un símbolo permitido (@ _ . ; : -)"
    )
    @Column(value = "password")
    private String password;

    @Column(value = "status")
    private Boolean status;
}
