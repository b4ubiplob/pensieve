package com.tan90.pensieve.to.converters;

import com.tan90.pensieve.persistence.entities.TStatus;
import com.tan90.pensieve.to.Status;

public class StatusConverter {

    private StatusConverter() {}

    public static Status getStatus(TStatus tStatus) {
        Status status = new Status();
        status.setValue(tStatus.getValue());
        status.setId(tStatus.getId());
        return status;
    }

    public static TStatus getTStatus(Status status) {
        TStatus tStatus = new TStatus();
        tStatus.setValue(status.getValue());
        return tStatus;
    }
}
