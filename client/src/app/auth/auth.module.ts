// When it comes to components, pipes and directives, 
//every module should import its own dependencies disregarding
// if the same dependencies were imported in the root module or in any other feature module.
// In short, even when having multiple feature modules, each one of them needs to import the CommonModule
//https://angular-2-training-book.rangle.io/handout/modules/feature-modules.html
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { LoginComponent } from './login/login.component';

import { AuthRoutingModule } from './auth-routing.module';
import { IfLoggedInGuard } from './login/if-logged-in.guard';
@NgModule({
    imports: [
        CommonModule,
        AuthRoutingModule

    ],
    declarations: [
        LoginComponent
    ],
    //Services here = accessable accross the app - NOTE - if we want to use this service in another lazyModule
    // and we want it to be singelton we need to use the forRoot() pattern
    providers: [],

    //export only that components directives and pipes
    // that need to be used outside of this module 
    //services are not need to be exported, the acceable accross the app
    exports: [LoginComponent]
})

export class AuthModule {
  /*
  using forRoot pattern to prevent 2 instances of service
  https://angular-2-training-book.rangle.io/handout/modules/shared-di-tree.html*/  
  static forRoot():ModuleWithProviders{
    return{
      ngModule:AuthModule,
      providers:[AuthService] /**i've decided to include the LoggedInGuard here and instead - i imported it only in the dashboard-routing module */
    }
  }

}
