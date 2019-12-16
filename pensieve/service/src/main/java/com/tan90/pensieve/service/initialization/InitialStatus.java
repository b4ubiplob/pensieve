package com.tan90.pensieve.service.initialization;

public enum InitialStatus {

    STARTED("Started"),
    COMPLETED("Completed"),
    IN_PROGRESS("In Progress"),
    INACTIVE("Inactive"),
    BLOCKED("Blocked");

    private String name;

    private InitialStatus(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }
}
