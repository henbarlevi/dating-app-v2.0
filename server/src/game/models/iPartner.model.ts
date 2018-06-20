/**
 * @description
 * in the begining of the game 
 * the player will know nothing about his partner/partners he is playing with,
 * as the game proceed , each certian of time the player receive a new info about his matched partner (name/age etc.)
 */
/**data about that partner that plays with the player */
export interface iPartner {
    id: string,
    first_name?: string,
    last_name?:string,
    gender?:string,
    age?:string,//maybe also add age_range
    score?: number,//TODOTODOTODO
    location?: string,
    photo_link?:string,//link to some photo of him
    profile_link?: string //link to his personal social page (facebook/instegram) 
}