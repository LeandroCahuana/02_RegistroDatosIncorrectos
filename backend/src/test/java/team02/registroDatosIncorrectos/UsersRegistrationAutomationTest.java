package team02.registroDatosIncorrectos;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

import team02.registroDatosIncorrectos.exception.GlobalExceptionHandler;
import team02.registroDatosIncorrectos.model.Users;
import team02.registroDatosIncorrectos.rest.UsersRest;
import team02.registroDatosIncorrectos.service.UsersService;

@ExtendWith(MockitoExtension.class)
public class UsersRegistrationAutomationTest {

    private WebTestClient webTestClient;

    @Mock
    private UsersService usersService;

    @InjectMocks
    private UsersRest usersRest;

    @BeforeEach
    void setUp() {
        this.webTestClient = WebTestClient.bindToController(usersRest)
                .controllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Caso C02: Registro con formato incorrecto en correo y celular debe devolver 400")
    public void testC02_InvalidEmailAndCellphoneFormat_ReturnsBadRequest() {
        // Arrange: Preparar datos base correctos
        Users invalidUser = new Users();
        invalidUser.setName("Juan Perez");
        invalidUser.setType_document("DNI");
        invalidUser.setNumber_document("12345678");
        invalidUser.setAge(25L);
        invalidUser.setGender("M");
        invalidUser.setPassword("Password123@");
        
        // Arrange: Inyectar datos INVÁLIDOS para el Caso C02
        invalidUser.setEmail("usuario_sin_dominio.com"); // Formato incorrecto
        invalidUser.setCellphone("123456789"); // Formato incorrecto

        // Act & Assert: Enviar petición y validar que el sistema lo rechaza
        webTestClient.post()
                .uri("/api/v1/users/save")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidUser)
                .exchange()
                .expectStatus().isBadRequest() // Comprueba que el status sea 400
                .expectBody()
                .jsonPath("$.status").isEqualTo(400)
                .jsonPath("$.errors.email").exists() // Comprueba que detectó el error de email
                .jsonPath("$.errors.cellphone").exists(); // Comprueba que detectó el error de celular
    }

    @Test
    @DisplayName("Caso C03: Registro con edad inferior a 18 debe devolver 400")
    public void testC03_AgeBelowMinimum_ReturnsBadRequest() {
        // Arrange: Preparar datos base correctos
        Users underageUser = new Users();
        underageUser.setName("Maria Gomez");
        underageUser.setType_document("DNI");
        underageUser.setNumber_document("87654321");
        underageUser.setEmail("maria@gmail.com");
        underageUser.setCellphone("987654321");
        underageUser.setGender("F");
        underageUser.setPassword("Password123@");
        
        // Arrange: Inyectar dato INVÁLIDO para el Caso C03
        underageUser.setAge(17L); // Edad no permitida

        // Act & Assert: Enviar petición y validar que el sistema lo rechaza
        webTestClient.post()
                .uri("/api/v1/users/save")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(underageUser)
                .exchange()
                .expectStatus().isBadRequest() // Comprueba que el status sea 400
                .expectBody()
                .jsonPath("$.status").isEqualTo(400)
                .jsonPath("$.errors.age").exists(); // Comprueba que detectó el error de edad
    }
}