// src/app/core/guards/non-auth.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NonAuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    // 1. Listen to the isAuthenticated$ observable
    return this.authService.isAuthenticated$.pipe(
      take(1), // Important: ensures the observable completes after the first value
      map(isAuthenticated => {
        if (isAuthenticated) {
          //  If authenticated, redirect them to the feed page
          this.router.navigate(['/feed']);
          return false; // Prevent access to the current route (/login or /register)
        }
        // If NOT authenticated, allow access
        return true;
      })
    );
  }
}