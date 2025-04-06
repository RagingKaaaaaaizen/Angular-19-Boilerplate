import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AccountService } from '@app/_services';

@Component({ 
    templateUrl: 'details.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule]
})
export class DetailsComponent {
    account = this.accountService.accountValue;

    constructor(private accountService: AccountService) { }
}

