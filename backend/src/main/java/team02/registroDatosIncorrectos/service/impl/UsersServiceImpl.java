package team02.registroDatosIncorrectos.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import team02.registroDatosIncorrectos.model.Users;
import team02.registroDatosIncorrectos.repository.UsersRepository;
import team02.registroDatosIncorrectos.service.UsersService;

@Slf4j
@Service
public class UsersServiceImpl implements UsersService {

    private final UsersRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UsersServiceImpl(UsersRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Flux<Users> findAll() {
        return repository.findAll();
    }

    @Override
    public Mono<Users> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Mono<Users> create(Users users) {
        users.setStatus(true);
        return Mono.fromCallable(() -> passwordEncoder.encode(users.getPassword()))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(hashedPassword -> {
                    users.setPassword(hashedPassword);
                    return repository.save(users);
                });
    }

    @Override
    public Mono<Users> update(Users users) {
        users.setStatus(true);
        return repository.findById(users.getId())
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado, id: " + users.getId())))
                .flatMap(userExistente -> {
                    userExistente.setName(users.getName());
                    userExistente.setType_document(users.getType_document());
                    userExistente.setNumber_document(users.getNumber_document());
                    userExistente.setEmail(users.getEmail());
                    userExistente.setCellphone(users.getCellphone());
                    userExistente.setAge(users.getAge());
                    userExistente.setGender(users.getGender());

                    if (users.getPassword() != null && !users.getPassword().isBlank()) {
                        return Mono.fromCallable(() -> passwordEncoder.encode(users.getPassword()))
                                .subscribeOn(Schedulers.boundedElastic())
                                .flatMap(hashedPassword -> {
                                    userExistente.setPassword(hashedPassword);
                                    return repository.save(userExistente);
                                });
                    }

                    return repository.save(userExistente);
                });
    }

    @Override
    public Mono<Users> delete(Long id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(
                        new RuntimeException("Usuario no encontrado, id: " + id)))
                .flatMap(existe -> {
                    existe.setStatus(false);
                    return repository.save(existe);
                });
    }

    @Override
    public Mono<Users> restore(Long id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(
                        new RuntimeException("Usuario no encontrado, id: " + id)))
                .flatMap(existe -> {
                    existe.setStatus(true);
                    return repository.save(existe);
                });
    }
}
