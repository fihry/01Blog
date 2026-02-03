import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterModule } from "@angular/router"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { UserService, User } from "../../../core/services/user.service"
import { AuthService } from "../../../core/services/auth.service"
import { ToastService } from "../../../core/services/toast.service"
import { take } from "rxjs/operators"

@Component({
    selector: "app-settings",
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: "./settings.component.html",
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
        private toastService: ToastService,
        private router: Router
    
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
                localStorage.setItem("user", JSON.stringify(updatedUser))
                this.authService.updateCurrentUser(updatedUser);
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
            this.loading = true;
            if (!this.user) {
                this.toastService.showError('Error', 'User not found.');
                this.loading = false;
                return;
            }
            this.userService.deleteAccount(this.user.id).subscribe({
                next: () => {
                    this.loading = false;
                    this.toastService.showSuccess('Success', 'Account deleted successfully.');
                    this.authService.logout();
                    this.router.navigate(['/login']);
                },
                error: (err: any) => {
                    this.loading = false;
                    this.toastService.showError('Error', err.error?.message || 'Failed to delete account.');
                }
            });
        } else {
            this.toastService.showWarning('Warning', 'Delete account feature is not fully implemented yet.');
        }
    }
}
