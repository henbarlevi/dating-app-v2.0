import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugGuard } from './debug.guard';
//import { ModalComponent } from './modal [bootstrap3.0]/modal.component';
import { ModalComponent } from './modal [pureCss]/modal.component';

//components:

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ModalComponent//reusable abstract modal 

  ],
  //export only that components directives and pipes
  // that need to be used outside of this module 
  //services are not need to be exported, the acceable accross the app
  exports: [ModalComponent],
  providers: []
})
export class SharedModule {
  //For Root
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [DebugGuard]
    }
  }
}

