import {ActionReducerMap} from '@ngrx/store';

// ==== Global App State ====
export interface iAppState{
    //auth : fromAuth.authState
}


export const appReducers:ActionReducerMap<iAppState> ={
    //auth : fromAuth.authReducer

    //gameReducer not exist in here because game its LazyModule
}