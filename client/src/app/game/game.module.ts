/**Lazy Module */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { GameRoutingModule } from './game-routing.module';
import { GameService } from './game.service';
import { LoadingGameComponent } from './loading-game/loading-game.component';
import { EndGamePageComponent } from './end-game-page/end-game-page.component';
import { ChoosePartnerQuestionModule } from './games/choose-partner-question/choose-partner-question.module';
//ngrx (redux)
import { StoreModule } from '@ngrx/store';
import { gameReducer } from './_ngrx/game.reducers';

//TODO - move each game component to individual lazy module:

/*NOTE - there is NO need to import SharedModule for his services, (because we already using the forRoot pattern in the app module),
 we import it to use his shared components and directives etc..*/
@NgModule({
  imports: [
    CommonModule,
    GameRoutingModule,

    //TODO - move each game component to individual lazy module:
    ChoosePartnerQuestionModule,
    //ngrx (redux)
    StoreModule.forFeature('game', gameReducer)
  ],
  //components ,directives ,pipes:
  declarations: [
    GameComponent,
    LoadingGameComponent,
    EndGamePageComponent

  ],
  //private services = accessable only inside the module:
  providers: [GameService]
})
export class GameModule {

}
