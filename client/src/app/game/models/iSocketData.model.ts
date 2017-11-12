//each time socket io emit event , this is what the body contain
export interface iSocketData{
    data :Array<any>,
    nsp:string |"/" //name space
    type:Number
}