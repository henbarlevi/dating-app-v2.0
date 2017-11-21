import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugGuard } from './debug.guard';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers:[]
})
export class SharedModule {
  //For Root
  static forRoot():ModuleWithProviders{
    return{
      ngModule:SharedModule,
      providers:[DebugGuard]
    }
  }
 }

