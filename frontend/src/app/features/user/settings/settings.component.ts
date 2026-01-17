import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { UserService, User } from "../../../core/services/user.service"
import { AuthService } from "../../../core/services/auth.service"
import { ToastService } from "../../../core/services/toast.service"
import { take } from "rxjs/operators"

@Component({
    selector: "app-settings",
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
    <div class="min-h-screen pt-5 mt-5">
      <div class="container-xl mx-auto py-5 px-4">
        
        <h1 class="text-3xl font-bold text-foreground mb-5">Settings</h1>

        <div class="row g-4">
            <!-- Sidebar Navigation -->
            <div class="col-lg-3">
                <div class="app-widget-card p-2 sticky-top" style="top: 100px;">
                    <ul class="nav flex-column nav-pills gap-1">
                        <li class="nav-item">
                            <a class="nav-link d-flex align-items-center gap-3 px-3 py-2 font-medium cursor-pointer" 
                               [class.active]="activeTab === 'profile'" 
                               (click)="activeTab = 'profile'">
                                <i class="bi bi-person"></i> Profile
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link d-flex align-items-center gap-3 px-3 py-2 font-medium cursor-pointer text-muted-foreground hover:text-foreground"
                               [class.active]="activeTab === 'account'" 
                               (click)="activeTab = 'account'">
                                <i class="bi bi-shield-lock"></i> Account
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link d-flex align-items-center gap-3 px-3 py-2 font-medium cursor-pointer text-muted-foreground hover:text-foreground"
                               [class.active]="activeTab === 'appearance'" 
                               (click)="activeTab = 'appearance'">
                                <i class="bi bi-palette"></i> Appearance
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Content Area -->
            <div class="col-lg-9">
                
                <!-- Profile Settings -->
                <div class="app-widget-card p-5 animate-in" *ngIf="activeTab === 'profile'">
                    <div class="mb-5 border-bottom border-muted pb-4">
                        <h2 class="text-xl font-bold mb-1">Public Profile</h2>
                        <p class="text-sm text-muted-foreground">Manage how you appear to others on ZeroOneBlog.</p>
                    </div>

                    <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                        <div class="d-flex align-items-center gap-4 mb-5">
                            <div class="avatar-wrapper position-relative">
                                <img [src]="avatarPreview || user?.avatarUrl || 'assets/images/default-avatar.png'" 
                                     class="rounded-circle object-fit-cover shadow-sm" 
                                     style="width: 80px; height: 80px;" 
                                     alt="Avatar">
                                <label for="avatar-input" class="avatar-edit-overlay position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer shadow" style="width: 28px; height: 28px;">
                                    <i class="bi bi-camera-fill text-xs"></i>
                                    <input type="file" id="avatar-input" class="visually-hidden" (change)="onFileSelected($event)" accept="image/*">
                                </label>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold mb-0">@{{ user?.username }}</h3>
                                <p class="text-xs text-muted-foreground m-0">Recommended 400x400px. JPG or PNG.</p>
                            </div>
                        </div>

                        <div class="row g-4">
                            <div class="col-12">
                                <label class="form-label text-sm font-medium">Bio</label>
                                <textarea class="form-control" rows="4" formControlName="bio" placeholder="Tell us about yourself..."></textarea>
                                <div class="form-text text-xs text-end">{{ profileForm.get('bio')?.value?.length || 0 }} / 255 characters</div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end mt-5">
                            <button type="submit" class="btn btn-primary px-4" [disabled]="profileForm.pristine || loading">
                                <span class="spinner-border spinner-border-sm me-2" *ngIf="loading"></span>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Account Settings -->
                <div class="app-widget-card p-5 animate-in" *ngIf="activeTab === 'account'">
                    <div class="mb-5 border-bottom border-muted pb-4">
                        <h2 class="text-xl font-bold mb-1">Account Security</h2>
                        <p class="text-sm text-muted-foreground">Manage your password and security preferences.</p>
                    </div>

                    <div class="mb-4">
                         <label class="form-label text-sm font-medium">Email Address</label>
                         <input type="email" class="form-control" [value]="user?.email" disabled>
                         <div class="form-text text-xs">Email cannot be changed directly. Contact support.</div>
                    </div>

                    <form [formGroup]="passwordForm" (ngSubmit)="updatePassword()">
                        <div class="border rounded-3 p-4 bg-muted/20 mb-5">
                            <h3 class="text-sm font-bold mb-3">Change Password</h3>
                            <div class="row g-3">
                                <div class="col-md-5">
                                    <input type="password" class="form-control" formControlName="currentPassword" placeholder="Current Password">
                                </div>
                                <div class="col-md-5">
                                    <input type="password" class="form-control" formControlName="newPassword" placeholder="New Password">
                                </div>
                                <div class="col-md-2">
                                    <button type="submit" class="btn btn-outline-secondary w-100" [disabled]="passwordForm.invalid || loading">
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    <hr class="border-muted my-5">

                    <div>
                        <h3 class="text-sm font-bold text-danger mb-2">Delete Account</h3>
                        <p class="text-sm text-muted-foreground mb-3">
                            Permanently delete your account and all of your content. This action cannot be undone.
                        </p>
                        <button class="btn btn-destructive text-sm" (click)="deleteAccount()">Delete Account</button>
                    </div>
                </div>

                 <!-- Appearance Settings -->
                 <div class="app-widget-card p-5 animate-in" *ngIf="activeTab === 'appearance'">
                    <div class="mb-5 border-bottom border-muted pb-4">
                        <h2 class="text-xl font-bold mb-1">Appearance</h2>
                        <p class="text-sm text-muted-foreground">Customize how the app looks on your device.</p>
                    </div>

                    <div class="row g-4">
                        <div class="col-md-4">
                            <div class="border rounded-3 p-3 cursor-pointer hover:border-primary transition-all text-center">
                                <div class="bg-white border rounded mb-2 h-20 w-full mx-auto shadow-sm"></div>
                                <span class="font-medium text-sm">Light Mode</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="border rounded-3 p-3 cursor-pointer hover:border-primary transition-all text-center bg-slate-950">
                                <div class="bg-slate-900 border border-slate-800 rounded mb-2 h-20 w-full mx-auto"></div>
                                <span class="font-medium text-sm text-white">Dark Mode</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="border rounded-3 p-3 cursor-pointer hover:border-primary transition-all text-center">
                                <div class="bg-gradient-to-r from-gray-100 to-slate-900 border rounded mb-2 h-20 w-full mx-auto"></div>
                                <span class="font-medium text-sm">System</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .nav-pills .nav-link.active {
        background-color: hsl(var(--primary) / 0.1);
        color: hsl(var(--primary));
    }
  `]
})
export class SettingsComponent implements OnInit {
    activeTab = 'profile';
    profileForm: FormGroup;
    passwordForm: FormGroup;
    user: User | null = null;
    avatarPreview: string | null = null;
    selectedFile: File | null = null;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private authService: AuthService,
        private toastService: ToastService
    ) {
        this.profileForm = this.fb.group({
            bio: ['', [Validators.maxLength(255)]]
        });

        this.passwordForm = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    ngOnInit() {
        this.loadUserData();
    }

    loadUserData() {
        this.authService.currentUser$.pipe(take(1)).subscribe((currentUser: any) => {
            if (currentUser) {
                this.userService.getUserById(currentUser.id).subscribe((user: User) => {
                    this.user = user;
                    this.profileForm.patchValue({
                        bio: user.bio
                    });
                });
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                this.avatarPreview = reader.result as string;
                this.profileForm.markAsDirty();
            };
            reader.readAsDataURL(file);
        }
    }

    saveProfile() {
        if (!this.user || this.profileForm.invalid) return;

        this.loading = true;
        this.userService.updateProfile(this.user.id, {
            bio: this.profileForm.value.bio,
            avatar: this.selectedFile || undefined
        }).subscribe({
            next: (updatedUser: User) => {
                this.user = updatedUser;
                this.loading = false;
                this.profileForm.markAsPristine();
                this.selectedFile = null;
                this.toastService.showSuccess('Success', 'Profile updated successfully');
            },
            error: (err: any) => {
                this.loading = false;
                this.toastService.showError('Error', err.error?.message || 'Failed to update profile');
            }
        });
    }

    updatePassword() {
        if (!this.user || this.passwordForm.invalid) return;

        this.loading = true;
        this.userService.changePassword(this.user.id, this.passwordForm.value).subscribe({
            next: () => {
                this.loading = false;
                this.passwordForm.reset();
                this.toastService.showSuccess('Success', 'Password updated successfully');
            },
            error: (err: any) => {
                this.loading = false;
                this.toastService.showError('Error', err.error?.message || 'Failed to update password');
            }
        });
    }

    deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // Implementation logic if we have one. For now, just a placeholder.
            this.toastService.showWarning('Warning', 'Delete account feature is not fully implemented yet.');
        }
    }
}
