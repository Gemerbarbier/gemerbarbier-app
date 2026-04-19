package sk.gemerbarbier.web.rest.controller.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sk.gemerbarbier.domain.AuthResponse;
import sk.gemerbarbier.domain.UserInfo;
import sk.gemerbarbier.domain.request.LoginRequest;
import sk.gemerbarbier.service.security.JwtService;
import sk.gemerbarbier.storage.UserStorage;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final UserStorage userStorage;

  public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
      UserStorage userStorage) {
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
    this.userStorage = userStorage;
  }

  @PostMapping("/login")
  public AuthResponse login(@RequestBody LoginRequest request) {
    var auth = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.username(), request.password()));

    var userDetails = (UserDetails) auth.getPrincipal();
    var user = userStorage.getUser(userDetails.getUsername());

    return new AuthResponse(jwtService.generateAccessToken(userDetails),
        jwtService.generateRefreshToken(userDetails), "Bearer",
        jwtService.getAccessTokenExpiration(), new UserInfo(user.getId(), user.getUsername()));
  }
}
