package sk.gemerbarbier;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GemerbarbierApplication {

  public static void main(String[] args) {
    SpringApplication.run(GemerbarbierApplication.class, args);
  }
}
