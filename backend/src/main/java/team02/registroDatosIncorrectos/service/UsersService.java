package team02.registroDatosIncorrectos.service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import team02.registroDatosIncorrectos.model.Users;

public interface UsersService {

    Flux<Users> findAll();

    Mono<Users> findById(Long id);

    Mono<Users> create(Users users);

    Mono<Users> update(Users users);

    Mono<Users> delete(Long id);

    Mono<Users> restore(Long id);
}
