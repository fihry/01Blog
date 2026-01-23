import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';


export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

@Injectable({ providedIn: 'root' })
export class AccessGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const access = route.data['access'] as 'auth' | 'guest' | 'admin';

    return this.auth.currentUser$.pipe(
      take(1),
      map(user => {

        if (access === 'guest') {
          return user
            ? this.router.createUrlTree(['/feed'])
            : true;
        }

        if (access === 'auth') {
          return user
            ? true
            : this.router.createUrlTree(['/login']);
        }

        if (access === 'admin') {
          if (!user) {
            return this.router.createUrlTree(['/login']);
          }
          if (user.role !== Role.ADMIN) {
            return this.router.createUrlTree(['/feed']);
          }
          return true;
        }

        return false;
      })
    );
  }
}
