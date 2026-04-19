package sk.gemerbarbier.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.gemerbarbier.entity.Barber;

public interface BarberRepository extends JpaRepository<Barber, Long> {


}
