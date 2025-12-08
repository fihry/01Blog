// src/app/shared/components/navbar/navbar.component.ts

import { Component, HostBinding, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'; // Imported but not used in TS

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterLink, NgbDropdownModule],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"] 
})
export class NavbarComponent implements OnInit {
  // Using isMobileMenuOpen for collapse state instead of 'collapsed'
  // for consistency with existing methods.
  isAuthenticated$: Observable<boolean>;
  currentUserDisplayName$: Observable<string>;
  currentUserDisplayAvatarUrl$: Observable<string>;
  isAdmin = false;

  isMobileMenuOpen = false;
  isProfileDropdownOpen = false;
  
  isDarkMode = document.body.classList.contains("dark"); 

  @HostBinding("class.dark")
  get dark() {
    return this.isDarkMode;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    
    // 💡 FIX: Correctly initialize observables using pipe and map
    this.currentUserDisplayName$ = this.authService.currentUser$.pipe(
      map(user => user ? user.username : 'Anonime')
    );
    
    // 💡 FIX: Correctly derive avatar URL, falling back to ui-avatars API
    this.currentUserDisplayAvatarUrl$ = this.authService.currentUser$.pipe(
      map(user => 
        user?.avatar_url || 
        `https://ui-avatars.com/api/?name=${user?.username || 'Anonime'}`
      )
    );
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'ADMIN'; 
    });
  }

  toggleMobileMenu() {
    // This state controls the Bootstrap collapse class
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.isProfileDropdownOpen = false;
  }

  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    this.isMobileMenuOpen = false;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle("dark"); 
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.closeMenus();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
    this.closeMenus();
  }

  closeMenus() {
    this.isProfileDropdownOpen = false;
    this.isMobileMenuOpen = false;
  }
}