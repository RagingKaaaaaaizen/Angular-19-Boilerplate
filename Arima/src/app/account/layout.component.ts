import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { AccountService } from '@app/_services';

@Component({
    templateUrl: 'layout.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class LayoutComponent {
    loginForm!: UntypedFormGroup;
    loading = false;
    submitted = false;

    constructor(
        private router: Router,
        private accountService: AccountService,
        private formBuilder: UntypedFormBuilder
    ) {
        // redirect to home if already logged in
        if (this.accountService.accountValue) {
            this.router.navigate(['/']);
        }

        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        // Add your login logic here
    }
}
