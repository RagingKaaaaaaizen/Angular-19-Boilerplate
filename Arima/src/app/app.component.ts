import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AccountService } from './_services';
import { Account, Role } from './_models';
import { AlertComponent } from './_components';

@Component({ 
    selector: 'app', 
    templateUrl: 'app.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule, AlertComponent]
})
export class AppComponent {
    Role = Role;
    account: Account | null = null;

    constructor(private accountService: AccountService) {
        this.accountService.account.subscribe(x => this.account = x);
    }
    logout() {
        this.accountService.logout();
    }
}