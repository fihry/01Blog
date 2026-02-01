import type { Routes } from "@angular/router"
import { AccessGuard } from './core/guards/acsess.guard';
import { LoginComponent } from "../app/features/auth/login/login.component"
import { RegisterComponent } from "../app/features/auth/register/register.component"
import { FeedComponent } from "./features/feed/feed.component"
import { ProfileComponent } from "./features/user/profile/profile.component"
import { AdminDashboardComponent } from "./features/admin/admin-dashboard/admin-dashboard.component"
import { PostDetailComponent } from "./shared/components/post-detail/post-detail.component"
import { SettingsComponent } from "./features/user/settings/settings.component"
import { NotificationListComponent } from "./features/notification/notification-list/notification-list.component"
import { UsersComponent } from "./features/user/users/users.component"
import { NotFoundComponent } from "./shared/components/not-found/not-found.component"

export const routes: Routes = [

  {
    path: "login",
    component: LoginComponent,
    canActivate: [AccessGuard],
    data: { access: 'guest' }
  },

  {
    path: "register",
    component: RegisterComponent,
    canActivate: [AccessGuard],
    data: { access: 'guest' }
  },

  {
    path: "feed",
    component: FeedComponent,
    canActivate: [AccessGuard],
    data: { access: 'auth' }
  },

  {
    path: "profile/:id",
    component: ProfileComponent,
    canActivate: [AccessGuard],
    data: { access: 'auth' }
  },
  {
    path: "users",
    component: UsersComponent,
    canActivate: [AccessGuard],
    data: { access: 'auth' }
  },

  {
    path: "post/:id",
    component: PostDetailComponent,
    canActivate: [AccessGuard],
    data: { access: 'auth' }
  },

  {
    path: "notifications",
    component: NotificationListComponent,
    canActivate: [AccessGuard],
    data: { access: 'auth' }
  },

  {
    path: "settings",
    component: SettingsComponent,
    canActivate: [AccessGuard],
    data: { access: 'auth' }
  },

  {
    path: "admin",
    component: AdminDashboardComponent,
    canActivate: [AccessGuard],
    data: { access: 'admin' }
  },
  {
    path: "",
    redirectTo: "feed",
    pathMatch: "full",
  },
  { path: "**", component: NotFoundComponent }
];
