package team02.registroDatosIncorrectos;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.reactive.ReactiveSecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

import team02.registroDatosIncorrectos.model.Users;
import team02.registroDatosIncorrectos.rest.UsersRest;
import team02.registroDatosIncorrectos.service.UsersService;

// Se desactiva la seguridad reactiva solo para que la prueba pueda evaluar los datos sin ser bloqueada
@WebFluxTest(controllers = UsersRest.class, excludeAutoConfiguration = {ReactiveSecurityAutoConfiguration.class})
public class UsersRegistrationAutomationTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private UsersService usersService;

    @Test
    @DisplayName("Caso C02: Registro con formato incorrecto en correo y celular debe devolver 400")
    public void testC02_InvalidEmailAndCellphoneFormat_ReturnsBadRequest() {
        Users invalidUser = new Users();
        invalidUser.setName("Juan Perez");
        invalidUser.setType_document("DNI");
        invalidUser.setNumber_document("12345678");
        invalidUser.setAge(25L);
        invalidUser.setGender("M");
        invalidUser.setPassword("Password123@");
        
        invalidUser.setEmail("usuario_sin_dominio.com"); 
        invalidUser.setCellphone("123456789"); 

        webTestClient.post()
                .uri("/api/v1/users/save")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidUser)
                .exchange()
                .expectStatus().isBadRequest() 
                .expectBody()
                .jsonPath("$.status").isEqualTo(400)
                .jsonPath("$.errors.email").exists() 
                .jsonPath("$.errors.cellphone").exists(); 
    }

    @Test
    @DisplayName("Caso C03: Registro con edad inferior a 18 debe devolver 400")
    public void testC03_AgeBelowMinimum_ReturnsBadRequest() {
        Users underageUser = new Users();
        underageUser.setName("Maria Gomez");
        underageUser.setType_document("DNI");
        underageUser.setNumber_document("87654321");
        underageUser.setEmail("maria@gmail.com");
        underageUser.setCellphone("987654321");
        underageUser.setGender("F");
        underageUser.setPassword("Password123@");
        
        underageUser.setAge(17L); 

        webTestClient.post()
                .uri("/api/v1/users/save")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(underageUser)
                .exchange()
                .expectStatus().isBadRequest() 
                .expectBody()
                .jsonPath("$.status").isEqualTo(400)
                .jsonPath("$.errors.age").exists(); 
    }
}