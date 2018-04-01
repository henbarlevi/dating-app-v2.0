import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AuthModule } from './auth'
import { AppRoutingModule } from './app.routing';
import { DashboardModule } from './dashboard/dashboard.module';
import { SharedModule } from './shared/shared.module';
import { environment } from '../environments/environment';
/*==== redux ====*/
import { StoreModule, MetaReducer, ActionReducer } from '@ngrx/store';
import { appReducers, iAppState } from './_ngrx/app.reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';//debugger #1 (using chrome extension 'redux-devtools')
import { storeLogger } from "ngrx-store-logger";//debugger #2
import { storeFreeze } from 'ngrx-store-freeze';
export function logger(reducer: ActionReducer<any>): any {//#2 debugger
  // default, no options
  return storeLogger()(reducer);
}
export const metaReducers: MetaReducer<iAppState>[] = !environment.production ? [storeFreeze, logger] : [];//redux debbuger

/*=========== APP MODULE ===========*/
@NgModule({
  /**Components/Pipes/Directives */
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    SharedModule.forRoot(),/**Lazy Modules import this Module. using forRoot() to prevent second instance for its services*/

    //routing order matters
    AuthModule.forRoot(),/**Lazy Modules import this Module. using forRoot() to prevent second instance for its services */
    DashboardModule,
    AppRoutingModule,
    //ngrx (redux)
    StoreModule.forRoot(appReducers, /*debuuger:*/{ metaReducers }),
    //!environment.production ? StoreDevtoolsModule.instrument() : [] //log debuggin only in dev ENV
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
