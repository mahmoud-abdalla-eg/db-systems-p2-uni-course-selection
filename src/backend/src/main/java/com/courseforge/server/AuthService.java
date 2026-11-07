package com.courseforge.server;

import com.courseforge.model.Models.User;
import com.courseforge.store.Database;
import com.sun.net.httpserver.HttpExchange;

import java.sql.SQLException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class AuthService {
    private final Database database;
    private final Map<String, User> sessions = new ConcurrentHashMap<>();

    public AuthService(Database database) {
        this.database = database;
    }

    public User login(String email, String password) throws SQLException {
        User user = database.findUserByEmailAndPassword(email, password)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));
        String token = UUID.randomUUID().toString();
        user.token = token;
        sessions.put(token, user);
        return user;
    }

    public Optional<User> currentUser(HttpExchange exchange) {
        String header = exchange.getRequestHeaders().getFirst("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return Optional.empty();
        }
        String token = header.substring("Bearer ".length()).trim();
        return Optional.ofNullable(sessions.get(token));
    }

    public User requireUser(HttpExchange exchange) {
        return currentUser(exchange).orElseThrow(() -> new SecurityException("Please log in first."));
    }

    public User requireAdmin(HttpExchange exchange) {
        User user = requireUser(exchange);
        if (!"ADMIN".equalsIgnoreCase(user.role)) {
            throw new SecurityException("Administrator access required.");
        }
        return user;
    }
}
