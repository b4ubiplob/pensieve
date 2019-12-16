package com.tan90.pensieve.service.initialization;

public enum InitialTaskTypes {

    BUG("Bug"),
    TASK("Task"),
    PROPOSAL("Proposal"),
    ENHANCEMENT("Enhancement"),
    EPIC("Epic"),
    BACKLOG("Backlog");


    private String name;

    private InitialTaskTypes(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }

}
