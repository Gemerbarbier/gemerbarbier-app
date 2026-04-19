package sk.gemerbarbier.service.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  @Value("${jwt.secret}")
  private String secret;

  private static final long ACCESS_TOKEN_EXP = 15 * 60; // seconds
  private static final long REFRESH_TOKEN_EXP = 7 * 24 * 60 * 60;

  private Key getKey() {
    return Keys.hmacShaKeyFor(
        secret.getBytes(StandardCharsets.UTF_8)
    );
  }

  public String generateAccessToken(UserDetails user) {
    return Jwts.builder()
        .setSubject(user.getUsername())
        .setIssuedAt(new Date())
        .setExpiration(
            new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXP * 1000)
        )
        .signWith(getKey(), SignatureAlgorithm.HS256)
        .compact();
  }

  public String generateRefreshToken(UserDetails user) {
    return Jwts.builder()
        .setSubject(user.getUsername())
        .setIssuedAt(new Date())
        .setExpiration(
            new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXP * 1000)
        )
        .signWith(getKey(), SignatureAlgorithm.HS256)
        .compact();
  }

  public long getAccessTokenExpiration() {
    return ACCESS_TOKEN_EXP;
  }

  public String extractUsername(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(getKey())
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getSubject();
  }


  public boolean isTokenValid(String token, UserDetails userDetails) {
    try {
      var claims = Jwts.parserBuilder()
          .setSigningKey(getKey())
          .build()
          .parseClaimsJws(token)
          .getBody();

      return claims.getSubject().equals(userDetails.getUsername()) &&
          claims.getExpiration().after(new Date());
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }


  public boolean isRefreshTokenValid(String token) {
    try {
      Jwts.parserBuilder()
          .setSigningKey(getKey())
          .build()
          .parseClaimsJws(token);
      return true;
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }


  public String extractUsernameFromToken(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(getKey())
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getSubject();
  }
}
