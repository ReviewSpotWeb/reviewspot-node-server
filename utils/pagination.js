export const validateOffsetAndLimit = (offset, limit) => {
    return offset >= 0 && limit > 0 && limit <= 50;
};

export const getPageFromModelList = (listOfModel, offset, limit) => {
    let prev, next;
    if (offset == 0) {
        prev = null;
    } else {
        prev = { offset: offset - limit, limit };
    }

    if (offset + limit >= listOfModel.length) {
        next = null;
    } else {
        next = { offset: offset + limit, limit };
    }

    const startIndex = offset;
    const endIndexBasedOnOffset = offset + limit;
    const endIndexOfList = listOfModel.length;
    const listSlice = listOfModel.slice(
        startIndex,
        Math.min(endIndexBasedOnOffset, endIndexOfList)
    );
    return { prev, next, listSlice };
};
