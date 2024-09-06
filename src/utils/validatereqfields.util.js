const validatefields=(validationFieldsobj)=>{
    let i=0;
    let j=0;
    let firstKey;
    for(let key in validationFieldsobj)
    {
        let item=validationFieldsobj[key];
        if(item === null || item===undefined)
        {

            firstKey=key;
            j++
        }
        i++;
    }

    if(i==j)
    {
    return {
                parameterisNull:true,
                parameterName:"All data fields"
            };
    }
    else if(i!=j && j!=0)
    {
        return {
            parameterisNull:true,
            parameterName:""+firstKey
        };
    }
    return {parameterisNull:false};
}
export {validatefields};