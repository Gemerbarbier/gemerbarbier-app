package sk.gemerbarbier.config;

import static java.util.Optional.ofNullable;

import java.lang.reflect.Field;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InjectionPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.core.MethodParameter;

@Configuration
public class LoggingConfiguration {

  @Bean
  @Scope("prototype")
  public Logger logger(InjectionPoint injectionPoint) {
    return LoggerFactory.getLogger(
        getClass(injectionPoint)
    );
  }

  private Class<?> getClass(InjectionPoint injectionPoint) {
    if (getContainingClassFromMethod(injectionPoint).isPresent()) {
      return getContainingClassFromMethod(injectionPoint).get();
    } else if (getDeclaringClassFromField(injectionPoint).isPresent()) {
      return getDeclaringClassFromField(injectionPoint).get();
    }
    throw new IllegalArgumentException();
  }

  private Optional<Class<?>> getContainingClassFromMethod(InjectionPoint injectionPoint) {
    return ofNullable(injectionPoint.getMethodParameter())
        .map(MethodParameter::getContainingClass);
  }

  private Optional<Class<?>> getDeclaringClassFromField(InjectionPoint injectionPoint) {
    return ofNullable(injectionPoint.getField())
        .map(Field::getDeclaringClass);
  }

}
