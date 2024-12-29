import { Random,MersenneTwister19937 } from "random-js"
const keyPrefix={
    "exam":"e",
    "student":"s",
    "result":"r",
    "admin":"a"
}
const idLength=7;
//generate randomstring with resource prefix of length 8
export const generatePublicId=(resourceType)=>{
   

    let random = new Random(MersenneTwister19937.autoSeed());
    let randomString=random.string(idLength);
    return keyPrefix[resourceType]+randomString;
//s1234240
//e123456
//r124544
}