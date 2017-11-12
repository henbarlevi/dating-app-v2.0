import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'; //import router module
import { GameComponent } from './game.component';
import { LoadingGameComponent } from './loading-game/loading-game.component';


 const gameRouting = RouterModule.forChild([


  {
    path: '',
    component: GameComponent,
    children:[
      {path:'',pathMatch:"full",component:LoadingGameComponent}
    ]

  },


]);

@NgModule({
  imports: [
    gameRouting
  ],
  exports: [RouterModule],
  providers: [
   // AuthGuard
  ]
})
export class GameRoutingModule {}
// ==== SNNIPETS
// const recipesRoutes: Routes = [
//   { path: '', component: RecipesComponent, children: [
//     { path: '', component: RecipeStartComponent },
//     { path: 'new', component: RecipeEditComponent, canActivate: [AuthGuard] },
//     { path: ':id', component: RecipeDetailComponent },
//     { path: ':id/edit', component: RecipeEditComponent, canActivate: [AuthGuard] },
//   ] },
// ];

// {
//   path: 'dashboard',
//   component: DashboardComponent,
//   children:[
//     {path:'',component:HomeComponent},
//     { path: 'game', loadChildren: './../game/game.module#GameModule' }//when route is 'lazy' -loading the lazy module
    
//   ]
//   ,canActivate: [IfLoggedInGuard]
// }

