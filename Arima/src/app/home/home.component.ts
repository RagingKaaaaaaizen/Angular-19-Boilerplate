import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountService } from '@app/_services';

@Component({ 
    templateUrl: 'home.component.html',
    standalone: true,
    imports: [CommonModule]
})
export class HomeComponent {
    account = this.accountService.accountValue;

    constructor(private accountService: AccountService) { }
}
