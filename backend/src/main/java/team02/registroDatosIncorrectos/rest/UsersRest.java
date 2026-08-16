package team02.registroDatosIncorrectos.rest;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import team02.registroDatosIncorrectos.model.Users;
import team02.registroDatosIncorrectos.service.UsersService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/users")
public class UsersRest {

    private UsersService service;

    @Autowired
    public UsersRest(UsersService service) {
        this.service = service;
    }

    @GetMapping
    public Flux<Users> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Mono<Users> findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping("/save")
    public Mono<Users> create(@Valid @RequestBody Users users) {
        return service.create(users);
    }

    @PutMapping("/update")
    public Mono<Users> update(@Valid @RequestBody Users users) {
        return service.update(users);
    }

    @PatchMapping("/delete/{id}")
    public Mono<Users> delete(@PathVariable Long id) {
        return service.delete(id);
    }

    @PatchMapping("/restore/{id}")
    public Mono<Users> restore(@PathVariable Long id) {
        return service.restore(id);
    }
}
