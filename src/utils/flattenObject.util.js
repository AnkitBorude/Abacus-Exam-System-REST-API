export function flattenObject(obj, parentKey = '', result = []) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = parentKey ? `${parentKey}.${key}` : key;
            if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
                // Recursive call for nested objects
                flattenObject(obj[key], newKey, result);
            } else {
                // Push the key-value pair as an array
                result.push([newKey, obj[key]]);
            }
        }
    }
    return result;
}