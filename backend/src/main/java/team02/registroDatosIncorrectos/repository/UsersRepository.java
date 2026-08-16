package team02.registroDatosIncorrectos.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import team02.registroDatosIncorrectos.model.Users;

@Repository
public interface UsersRepository extends ReactiveCrudRepository<Users, Long> {
}
