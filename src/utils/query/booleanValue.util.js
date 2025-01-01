export const getBooleanfromQueryParameter = (parameter) => {
    if (parameter === undefined) {
        return false;
    }
    //trim the parameter
    let boolean_qValue = parameter.trim();

    if (
        ['true', '1', 'yes', 'assessment'].includes(
            boolean_qValue.toLowerCase()
        )
    ) {
        return true;
    }
    if (['false', '0', 'no', 'practice'].includes(boolean_qValue.toLowerCase()))
        return false;
};
