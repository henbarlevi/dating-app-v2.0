import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'; //import router module
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './home/home.component';


 const dasboardRouting = RouterModule.forChild([


  {
    path: 'dashboard',
    component: DashboardComponent,
    children:[
      {path:'',component:HomeComponent}
    ]
  },


]);

@NgModule({
  imports: [
    dasboardRouting
  ],
  exports: [RouterModule],
  providers: [
   // AuthGuard
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