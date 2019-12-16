package com.tan90.pensieve.service.initialization;

public enum InitialUserRole {

    PROJECT_OWNER("project_owner"),
    PROJECT_MEMBER("project_member"),
    GUEST("guest");

    private String role;

    private InitialUserRole(String role) {
        this.role = role;
    }

    public String getRole() {
        return this.role;
    }
}
