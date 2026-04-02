package com.tan90.projects.pensieve.runner;

import com.tan90.projects.pensieve.service.TrelloMigrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * CommandLineRunner to execute the Trello migration.
 * This will run automatically when the Spring Boot application starts.
 *
 * To enable this runner, uncomment the @Component annotation.
 * To disable it, comment out the @Component annotation.
 */
@Component  // Uncomment this line to enable the migration on application startup
public class TrelloMigrationRunner implements CommandLineRunner {

    @Autowired
    private TrelloMigrationService trelloMigrationService;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("\n========================================");
        System.out.println("Starting Trello Books Migration...");
        System.out.println("========================================\n");

        try {
            //trelloMigrationService.migrateBooksFromJson();

            //trelloMigrationService.migrateMoviesFromJson();

            //trelloMigrationService.migratePersonalTasksFromJson();x

            //trelloMigrationService.migrateTVShowsFromJson();

            System.out.println("\n========================================");
            System.out.println("Trello Books Migration Completed Successfully!");
            System.out.println("========================================\n");
        } catch (Exception e) {
            System.err.println("\n========================================");
            System.err.println("Trello Books Migration Failed!");
            System.err.println("========================================\n");
            throw e;
        }
    }
}
