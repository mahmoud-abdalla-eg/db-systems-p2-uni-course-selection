package com.courseforge.server;

import com.courseforge.model.Models.*;
import com.courseforge.store.Database;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.sql.SQLException;
import java.util.Map;

public class ApiServer {
    private final Database database;
    private final AuthService authService;
    private final HttpServer server;
    private final int port;

    public ApiServer(Database database, int port) throws IOException {
        this.database = database;
        this.port = port;
        this.authService = new AuthService(database);
        this.server = HttpServer.create(new InetSocketAddress(port), 0);
        this.server.createContext("/api", this::handleApi);
    }

    public void start() {
        server.start();
        System.out.printf("[SERVER] Uni Course Selection API listening on http://localhost:%d%n", port);
    }

    public void stop() {
        server.stop(0);
    }

    private void handleApi(HttpExchange exchange) throws IOException {
        try {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();

            // Health
            if (method.equals("GET") && path.equals("/api/health")) {
                Json.send(exchange, 200, Map.of(
                        "status", "ok",
                        "app", "Uni Course Selection",
                        "version", "1.0.0"
                ));
            }
            // Auth
            else if (method.equals("POST") && path.equals("/api/auth/login")) {
                LoginRequest req = Json.read(exchange, LoginRequest.class);
                if (req == null || req.email == null || req.email.trim().isEmpty() || req.password == null || req.password.isEmpty()) {
                    throw new IllegalArgumentException("Email and password are required.");
                }
                if (req.password.length() < 6) {
                    throw new IllegalArgumentException("Password must contain at least 6 characters.");
                }
                User user = authService.login(req.email, req.password);
                Json.send(exchange, 200, user);
            }
            else if (method.equals("POST") && path.equals("/api/auth/register")) {
                RegisterRequest req = Json.read(exchange, RegisterRequest.class);
                if (req == null || req.email == null || req.email.trim().isEmpty() || req.password == null || req.password.isEmpty() || req.name == null || req.name.trim().isEmpty()) {
                    throw new IllegalArgumentException("Name, email, and password are required.");
                }
                if (req.password.length() < 6) {
                    throw new IllegalArgumentException("Password must contain at least 6 characters.");
                }
                if (!req.email.contains("@")) {
                    throw new IllegalArgumentException("Enter a valid email address.");
                }
                User user = database.createUser(
                        req.userNo != null ? req.userNo : "S" + System.currentTimeMillis() % 100000,
                        req.name,
                        req.email,
                        req.password,
                        req.major != null ? req.major : "Computer Science",
                        "STUDENT"
                );
                User loggedIn = authService.login(user.email, req.password);
                Json.send(exchange, 201, loggedIn);
            }
            else if (method.equals("GET") && path.equals("/api/auth/me")) {
                User user = authService.requireUser(exchange);
                Json.send(exchange, 200, user);
            }
            // Course Catalog
            else if (method.equals("GET") && path.equals("/api/courses")) {
                Json.send(exchange, 200, database.getAllCourses());
            }
            else if (method.equals("GET") && path.matches("/api/courses/\\d+")) {
                int id = Integer.parseInt(path.substring("/api/courses/".length()));
                Json.send(exchange, 200, database.getCourseById(id));
            }
            // Student Operations (Course Selection)
            else if (method.equals("GET") && path.equals("/api/student/dashboard")) {
                User user = authService.requireUser(exchange);
                StudentDashboard dashboard = database.getStudentDashboard(user.id);
                Json.send(exchange, 200, dashboard);
            }
            else if (method.equals("GET") && path.equals("/api/student/enrollments")) {
                User user = authService.requireUser(exchange);
                Json.send(exchange, 200, database.getEnrolledCourses(user.id));
            }
            else if (method.equals("GET") && path.equals("/api/student/history")) {
                User user = authService.requireUser(exchange);
                Json.send(exchange, 200, database.getAcademicHistory(user.id));
            }
            else if (method.equals("POST") && path.equals("/api/student/enroll")) {
                User user = authService.requireUser(exchange);
                CourseEnrollRequest req = Json.read(exchange, CourseEnrollRequest.class);
                if (req == null || req.courseId <= 0) {
                    throw new IllegalArgumentException("Valid courseId is required.");
                }

                // Enforce the 3 core requirements (prerequisites, 21 credit limit, no time conflicts)
                database.enrollCourse(user.id, req.courseId);

                // Return updated dashboard
                StudentDashboard dashboard = database.getStudentDashboard(user.id);
                Json.send(exchange, 200, Map.of(
                        "message", "Course added to your selection.",
                        "dashboard", dashboard
                ));
            }
            else if (method.equals("POST") && path.equals("/api/student/drop")) {
                User user = authService.requireUser(exchange);
                CourseEnrollRequest req = Json.read(exchange, CourseEnrollRequest.class);
                if (req == null || req.courseId <= 0) {
                    throw new IllegalArgumentException("Valid courseId is required.");
                }

                database.dropCourse(user.id, req.courseId);

                StudentDashboard dashboard = database.getStudentDashboard(user.id);
                Json.send(exchange, 200, Map.of(
                        "message", "Course removed from your selection.",
                        "dashboard", dashboard
                ));
            }
            else {
                Json.error(exchange, 404, "Endpoint not found: " + path);
            }
        } catch (IllegalArgumentException e) {
            Json.error(exchange, 400, e.getMessage());
        } catch (SecurityException e) {
            Json.error(exchange, 401, e.getMessage());
        } catch (SQLException e) {
            String detail = e.getMessage() == null ? "" : e.getMessage().toLowerCase();
            if (detail.contains("unique") || detail.contains("constraint")) {
                Json.error(exchange, 409, "An account with that email or student number already exists.");
            } else {
                e.printStackTrace();
                Json.error(exchange, 500, "Database error: " + e.getMessage());
            }
        } catch (Exception e) {
            e.printStackTrace();
            Json.error(exchange, 500, "Server error: " + e.getMessage());
        } finally {
            exchange.close();
        }
    }

    private void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
}
