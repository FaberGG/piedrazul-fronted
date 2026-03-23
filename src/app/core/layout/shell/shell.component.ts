import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell">
      <app-sidebar class="shell__sidebar" />
      <div class="shell__content">
        <app-topbar />
        <main class="shell__main">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .shell {
        display: grid;
        grid-template-columns: 240px 1fr;
        min-height: 100vh;
      }

      .shell__sidebar {
        border-right: 1px solid #e5e7eb;
      }

      .shell__content {
        display: grid;
        grid-template-rows: auto 1fr;
      }

      .shell__main {
        padding: 1rem;
      }
    `
  ]
})
export class ShellComponent {}

