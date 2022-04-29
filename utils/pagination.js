export const validateOffsetAndLimit = (offset, limit) => {
    return offset >= 0 && limit > 0 && limit <= 50;
};

export const getPageFromModelList = (listOfModel, offset, limit) => {
    let prev, next;
    if (offset == 0) {
        prev = null;
    } else {
        prev = { offset: offset - 1, limit };
    }

    if ((offset + 1) * limit >= listOfModel.length) {
        next = null;
    } else {
        next = { offset: offset + 1, limit };
    }

    const startIndex = offset * limit;
    const lastIndexBasedOnOffset = (offset + 1) * limit - 1;
    const lastIndexOfList = listOfModel.length - 1;
    const listSlice =
        lastIndexBasedOnOffset >= lastIndexOfList
            ? listOfModel.slice(startIndex)
            : listOfModel.slice(startIndex, lastIndexBasedOnOffset);
    return { prev, next, listSlice };
};
