package com.tan90.pensieve.persistence;

import com.tan90.pensieve.persistence.dao.Dao;
import com.tan90.pensieve.persistence.dao.impl.*;

public class DaoFactory {

    private DaoFactory() {}

    public static Dao getDao(DaoType type) {
        Dao dao = null;
        switch (type) {
            case ATTACHMENT:
                dao = new AttachmentDaoImpl();
                break;
            case COMMENT:
                dao = new CommentDaoImpl();
                break;
            case PRIORITY:
                dao = new PriorityDaoImpl();
                break;
            case PROJECT:
                dao = new ProjectDaoImpl();
                break;
            case STATUS:
                dao = new StatusDaoImpl();
                break;
            case TAG:
                dao = new TagDaoImpl();
                break;
            case TASK:
                dao = new TaskDaoImpl();
                break;
            case TASKTYPE:
                dao = new TaskTypeDaoImpl();
                break;
            case USER:
                dao = new UserDaoImpl();
                break;
            case USERHASPROJECT:
                dao = new UserProjectDaoImpl();
                break;
            case USERROLE:
                dao = new UserRoleDaoImpl();
                break;
                default:
                    throw new IllegalArgumentException("No Dao found for the tyoe " + type);
        }
        return dao;
    }
}
