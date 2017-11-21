import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'; //import router module
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './home/home.component';
import { AuthModule } from '../auth/auth.module';
import { IfLoggedInGuard } from '../auth/login/if-logged-in.guard';


 const dasboardRouting = RouterModule.forChild([


  {
    path: 'dashboard',
    component: DashboardComponent,
    children:[
      {path:'',component:HomeComponent},
      { path: 'game', loadChildren: './../game/game.module#GameModule' }//when route is 'lazy' -loading the lazy module
      
    ]
    ,canActivate: [IfLoggedInGuard]
  }


]);

@NgModule({
  imports: [
    AuthModule,
    dasboardRouting
  ],
  exports: [RouterModule],
  providers: [
      IfLoggedInGuard /**i've decided to import this Guard Only here, but i could import it in the forRoot of the AuthModule instead */
  ]
})
export class DashboardRoutingModule {}
// ==== SNNIPETS
// const recipesRoutes: Routes = [
//   { path: '', component: RecipesComponent, children: [
//     { path: '', component: RecipeStartComponent },
//     { path: 'new', component: RecipeEditComponent, canActivate: [AuthGuard] },
//     { path: ':id', component: RecipeDetailComponent },
//     { path: ':id/edit', component: RecipeEditComponent, canActivate: [AuthGuard] },
//   ] },
// ];