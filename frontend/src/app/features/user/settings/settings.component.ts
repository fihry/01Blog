import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"

@Component({
    selector: "app-settings",
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
    <div class="min-h-screen pt-5 mt-5">
      <div class="container-m mx-auto py-5 px-4">
        
        <h1 class="text-3xl font-bold text-foreground mb-5">Settings</h1>

        <div class="row g-4">
            <!-- Sidebar Navigation -->
            <div class="col-lg-3">
                <div class="app-widget-card p-2 sticky-top" style="top: 100px;">
                    <ul class="nav flex-column nav-pills gap-1">
                        <li class="nav-item">
                            <a class="nav-link active d-flex align-items-center gap-3 px-3 py-2 font-medium cursor-pointer" 
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

                    <form [formGroup]="profileForm">
                        <div class="d-flex align-items-center gap-4 mb-5">
                            <div class="avatar-large-placeholder w-20 h-20"></div>
                            <div>
                                <button class="btn btn-outline-secondary btn-sm mb-2">Change Avatar</button>
                                <p class="text-xs text-muted-foreground m-0">Recommended 400x400px. JPG or PNG.</p>
                            </div>
                        </div>

                        <div class="row g-4">
                            <div class="col-md-6">
                                <label class="form-label text-sm font-medium">Display Name</label>
                                <input type="text" class="form-control" formControlName="displayName">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-sm font-medium">Username</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-muted border-input text-muted-foreground">@</span>
                                    <input type="text" class="form-control" formControlName="username">
                                </div>
                            </div>
                            <div class="col-12">
                                <label class="form-label text-sm font-medium">Bio</label>
                                <textarea class="form-control" rows="4" formControlName="bio" placeholder="Tell us about yourself..."></textarea>
                                <div class="form-text text-xs text-end">0 / 160 characters</div>
                            </div>
                            <div class="col-12">
                                <label class="form-label text-sm font-medium">Website</label>
                                <input type="url" class="form-control" formControlName="website" placeholder="https://your-website.com">
                            </div>
                        </div>

                        <div class="d-flex justify-content-end mt-5">
                            <button class="btn btn-primary px-4" [disabled]="profileForm.pristine">Save Changes</button>
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
                         <input type="email" class="form-control" value="user@example.com" disabled>
                         <div class="form-text text-xs">Email cannot be changed directly. Contact support.</div>
                    </div>

                    <div class="border rounded-3 p-4 bg-muted/20 mb-5">
                        <h3 class="text-sm font-bold mb-3">Change Password</h3>
                        <div class="row g-3">
                            <div class="col-md-4">
                                <input type="password" class="form-control" placeholder="Current Password">
                            </div>
                            <div class="col-md-4">
                                <input type="password" class="form-control" placeholder="New Password">
                            </div>
                            <div class="col-md-4">
                                <button class="btn btn-outline-secondary w-100">Update Password</button>
                            </div>
                        </div>
                    </div>

                    <hr class="border-muted my-5">

                    <div>
                        <h3 class="text-sm font-bold text-danger mb-2">Delete Account</h3>
                        <p class="text-sm text-muted-foreground mb-3">
                            Permanently delete your account and all of your content. This action cannot be undone.
                        </p>
                        <button class="btn btn-destructive text-sm">Delete Account</button>
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
export class SettingsComponent {
    activeTab = 'profile';
    profileForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.profileForm = this.fb.group({
            displayName: ['User Name', Validators.required],
            username: ['username', Validators.required],
            bio: ['Full Stack Developer'],
            website: ['']
        });
    }
}
