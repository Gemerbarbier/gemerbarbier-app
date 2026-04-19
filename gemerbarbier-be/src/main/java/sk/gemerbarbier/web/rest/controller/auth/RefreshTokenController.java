package sk.gemerbarbier.web.rest.controller.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import sk.gemerbarbier.domain.AuthResponse;
import sk.gemerbarbier.domain.UserInfo;
import sk.gemerbarbier.domain.request.RefreshTokenRequest;
import sk.gemerbarbier.service.security.JwtService;
import sk.gemerbarbier.storage.UserStorage;

@RestController
@RequestMapping("/auth")
public class RefreshTokenController {

  private final JwtService jwtService;
  private final UserStorage userStorage;
  private final UserDetailsService userDetailsService;

  public RefreshTokenController(JwtService jwtService, UserStorage userStorage,
      UserDetailsService userDetailsService) {
    this.jwtService = jwtService;
    this.userStorage = userStorage;
    this.userDetailsService = userDetailsService;
  }

  @PostMapping("/refresh")
  public ResponseEntity<AuthResponse> refresh(
      @RequestBody RefreshTokenRequest request) {
    var refreshToken = request.refreshToken();

    if (refreshToken == null || !jwtService.isRefreshTokenValid(refreshToken)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    var username = jwtService.extractUsernameFromToken(refreshToken);

    var user = userStorage.getUser(username);
    var userDetails = userDetailsService.loadUserByUsername(username);

    var newAccessToken = jwtService.generateAccessToken(userDetails);
    var newRefreshToken = jwtService.generateRefreshToken(userDetails);

    return ResponseEntity.ok(new AuthResponse(newAccessToken, newRefreshToken, "Bearer",
        jwtService.getAccessTokenExpiration(), new UserInfo(user.getId(), user.getUsername())));
  }
}
