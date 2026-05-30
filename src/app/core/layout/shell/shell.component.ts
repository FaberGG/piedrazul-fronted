import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {
  readonly isSidebarCollapsed = signal(false);

  toggleSidebar(): void {
    if (!this.isCollapsibleViewport()) {
      return;
    }

    this.isSidebarCollapsed.update((collapsed) => !collapsed);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!this.isCollapsibleViewport() && this.isSidebarCollapsed()) {
      this.isSidebarCollapsed.set(false);
    }
  }

  private isCollapsibleViewport(): boolean {
    return window.innerWidth > 420;
  }
}

