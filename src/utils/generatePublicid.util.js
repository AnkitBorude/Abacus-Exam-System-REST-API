import { Random,MersenneTwister19937 } from "random-js"
let keyPrefix={
    "exam":"e",
    "student":"s",
    "result":"r",
    "admin":"a"
}
export const generatePublicId=(resourceType)=>{
   

    let random = new Random(MersenneTwister19937.seed(Date.now()));
    let randomString=random.string(7);
    return keyPrefix[resourceType]+randomString;
//s1234240
//e123456
//r124544
}