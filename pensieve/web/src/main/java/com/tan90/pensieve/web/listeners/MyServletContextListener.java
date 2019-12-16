package com.tan90.pensieve.web.listeners;

import com.tan90.pensieve.service.InitialiazationService;
import com.tan90.pensieve.service.impl.InitializationServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class MyServletContextListener implements ServletContextListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(MyServletContextListener.class);

    /** The servlet context with which we are associated. */
    private ServletContext context = null;
    private InitialiazationService initializationService;

    public void contextDestroyed(ServletContextEvent event) {
        log("Context destroyed");
        this.context = null;
    }

    public void contextInitialized(ServletContextEvent event) {
        this.context = event.getServletContext();
        log("Context initialized");
        LOGGER.debug("Initializing Listener");
        initializationService = new InitializationServiceImpl();
        initializationService.initialize();
    }

    private void log(String message) {
        if (context != null) {
            context.log("MyServletContextListener: " + message);
        } else {
            System.out.println("MyServletContextListener: " + message);
        }
    }
}
