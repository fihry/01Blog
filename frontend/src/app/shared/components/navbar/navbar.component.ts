// src/app/shared/components/navbar/navbar.component.ts

import { Component, HostBinding, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationBellComponent } from "../../../features/notification/notification-bell/notification-bell.component";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterLink, NgbDropdownModule, NotificationBellComponent],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit {
  // Using isMobileMenuOpen for collapse state instead of 'collapsed'
  // for consistency with existing methods.
  isAuthenticated$: Observable<boolean>;
  currentUserDisplayName$: Observable<string>;
  currentUserDisplayAvatarUrl$: Observable<string>;
  currentUserId: string = '';
  isAdmin = false;

  isMobileMenuOpen = false;
  isProfileDropdownOpen = false;

  isDarkMode = false;

  @HostBinding("class.dark")
  get dark() {
    return this.isDarkMode;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUserDisplayName$ = this.authService.currentUser$.pipe(
      map((user) => user?.username || "Guest"),
    );
    this.currentUserDisplayAvatarUrl$ = this.authService.currentUser$.pipe(
      map((user) => user?.avatarUrl || ''),
    );
    this.authService.currentUser$.subscribe((user) => {
      this.currentUserId = user?.id || '';
    });
  }

  ngOnInit(): void {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);

    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    }

    this.authService.currentUser$.subscribe((user) => {
      this.isAdmin = user?.role === "ADMIN";
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
    document.documentElement.classList.toggle("dark");
    // Also save preference to localStorage
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
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