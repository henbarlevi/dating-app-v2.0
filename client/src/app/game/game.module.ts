/**Lazy Module */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { GameRoutingModule } from './game-routing.module';
/*NOTE - there is NO need to import SharedModule for his services, (because we already using the forRoot pattern in the app module),
 we import it to use his shared components and directives etc..*/
@NgModule({
  imports: [
    CommonModule,
    GameRoutingModule
  ],
  //components ,directives ,pipes:
  declarations: [
    GameComponent
  ],
   //LazyPrivateService = accessable only inside the module
   providers:[]
})
export class GameModule { 

}
