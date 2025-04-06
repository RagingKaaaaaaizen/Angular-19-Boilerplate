import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({ 
  templateUrl: 'overview.component.html',
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class OverviewComponent { }
