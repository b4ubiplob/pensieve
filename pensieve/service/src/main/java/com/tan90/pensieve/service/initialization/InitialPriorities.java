package com.tan90.pensieve.service.initialization;

public enum InitialPriorities {

    TRIVIAL("Trivial"),
    MINOR("Minor"),
    MAJOR("Major"),
    CRITICAL("Critical"),
    BLOCKER("Blocker");

    private String name;

    private InitialPriorities(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }


}
