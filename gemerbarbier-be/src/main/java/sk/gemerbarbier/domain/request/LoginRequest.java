package sk.gemerbarbier.domain.request;

public record LoginRequest(
    String username,
    String password
) {}
