import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({ 
    templateUrl: 'layout.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule]
})
export class LayoutComponent { }
