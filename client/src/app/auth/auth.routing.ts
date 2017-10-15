import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';

export const authRouting = RouterModule.forChild([
    {
        path: 'login',
        component: LoginComponent
    }
])