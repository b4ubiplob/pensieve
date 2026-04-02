package com.tan90.projects.pensieve.dto;

public class ListReorderRequest {
    private String listId;
    private Integer displayOrder;

    // Constructors
    public ListReorderRequest() {
    }

    public ListReorderRequest(String listId, Integer displayOrder) {
        this.listId = listId;
        this.displayOrder = displayOrder;
    }

    // Getters and Setters
    public String getListId() {
        return listId;
    }

    public void setListId(String listId) {
        this.listId = listId;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
