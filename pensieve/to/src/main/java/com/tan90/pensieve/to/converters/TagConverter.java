package com.tan90.pensieve.to.converters;

import com.tan90.pensieve.persistence.entities.TTag;
import com.tan90.pensieve.to.Tag;

public class TagConverter {

    private TagConverter() {
    }

    public static Tag getTag(TTag tTag) {
        Tag tag = new Tag();
        tag.setValue(tTag.getValue());
        tag.setId(tTag.getId());
        return tag;
    }

    public static TTag getTTag(Tag tag) {
        TTag tTag = new TTag();
        tTag.setValue(tag.getValue());
        return tTag;
    }


}
