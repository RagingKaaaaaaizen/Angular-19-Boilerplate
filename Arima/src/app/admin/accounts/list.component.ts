import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AccountService } from '@app/_services';
import { Account } from '@app/_models';

// Extended interface with UI state properties
interface AccountWithStatus extends Account {
  isDeleting?: boolean;
}

@Component({ 
  templateUrl: 'list.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ListComponent implements OnInit {
  accounts: AccountWithStatus[] = [];
  
  constructor(private accountService: AccountService) {}
  
  ngOnInit() {
    this.accountService.getAll()
      .pipe(first())
      .subscribe(accounts => this.accounts = accounts as AccountWithStatus[]);
  }
  
  deleteAccount(id: number) {
    const account = this.accounts.find(x => x.id === id);
    if (!account) return;

    // add isDeleting flag for UI state
    account.isDeleting = true;
    
    this.accountService.delete(id.toString())
      .pipe(first())
      .subscribe(() => {
        this.accounts = this.accounts.filter(x => x.id !== id);
      });
  }
}
