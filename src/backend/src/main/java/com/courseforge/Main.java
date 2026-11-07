package com.courseforge;

import com.courseforge.server.ApiServer;
import com.courseforge.store.Database;

public class Main {
    public static void main(String[] args) {
        System.out.println("==================================================================");
        System.out.println("  Uni Course Selection: Database Systems Project 2             ");
        System.out.println("                     Project Two for DBS                          ");
        System.out.println("==================================================================");

        try {
            Database db = new Database();
            db.initialize();

            int port = 8080;
            String envPort = System.getenv("PORT");
            if (envPort != null && !envPort.isEmpty()) {
                try {
                    port = Integer.parseInt(envPort);
                } catch (NumberFormatException ignored) {}
            }

            ApiServer server = new ApiServer(db, port);
            server.start();

            System.out.println("[READY] Backend is active. Ready to handle course selection requests.");
            System.out.println("        API Base URL: http://localhost:" + port + "/api");
            System.out.println("        Health Check: http://localhost:" + port + "/api/health");
            System.out.println("==================================================================");

        } catch (Exception e) {
            System.err.println("[FATAL] Failed to initialize backend server: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
