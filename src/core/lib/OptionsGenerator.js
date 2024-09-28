import { Random } from "random-js";
const random = new Random();
// thus user will send the number and we have to send the back the array of three numbers and number
//itself with shuffled values.

const OptionsGenerator=(num)=>{
 //here in case the number is small then the chances of double option is more
    let i=0;
    let options=[];
    while(i<3)
    {
        let gnum=generateNearby(num);
        if(gnum!=num)
        {
            options.push(gnum);
            i++;
        }
    }
    options.push(num);
    return random.shuffle(options);
}
const generateNearby=(num) => { //might fail when generating nearby for smaller values
    const range = Math.max(1, Math.floor(num * 0.4)); // 10% of the number range
    const difference = Math.random() * range * 2 - range;
    return Math.max(0, Math.round(num + difference));
}
export default OptionsGenerator;
