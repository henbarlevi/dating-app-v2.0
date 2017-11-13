/**Lazy Module */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { GameRoutingModule } from './game-routing.module';
import { GameService } from './game.service';
import { LoadingGameComponent } from './loading-game/loading-game.component';
//TODO - move each game component to individual lazy module:
import { ChoosePartnerQuestionComponent } from './games/choose-partner-question/choose-partner-question.component';

/*NOTE - there is NO need to import SharedModule for his services, (because we already using the forRoot pattern in the app module),
 we import it to use his shared components and directives etc..*/
@NgModule({
  imports: [
    CommonModule,
    GameRoutingModule
  ],
  //components ,directives ,pipes:
  declarations: [
    GameComponent,
    LoadingGameComponent,
//TODO - move each game component to individual lazy module:
    ChoosePartnerQuestionComponent
  ],
  //LazyPrivateService = accessable only inside the module
  providers: [GameService]
})
export class GameModule {

}
