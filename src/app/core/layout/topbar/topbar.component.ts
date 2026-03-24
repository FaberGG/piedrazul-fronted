import { toSignal } from '@angular/core/rxjs-interop';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, startWith } from 'rxjs';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
      readonly isCompact = signal(false);

  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly navigationTick = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null)
    ),
    { initialValue: null }
  );

  readonly sectionTitle = computed(() => {
    this.navigationTick();
    const leaf = this.getLeafRoute(this.activatedRoute);
    return String(leaf.snapshot.data['sectionTitle'] ?? 'Panel principal');
  });

  readonly sectionDescription = computed(() => {
    this.navigationTick();
    const leaf = this.getLeafRoute(this.activatedRoute);
    return String(leaf.snapshot.data['sectionDescription'] ?? 'Gestion de agenda y configuracion del sistema.');
  });

  readonly userInitials = computed(() => {
    const fullName = this.authService.currentUser()?.nombreCompleto?.trim() ?? '';
    if (!fullName) {
      return 'US';
    }

    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase() ?? '')
      .join('');
  });

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isCompact.set(window.scrollY > 24);
  }


  private getLeafRoute(route: ActivatedRoute): ActivatedRoute {
    let current = route;

    while (current.firstChild) {
      current = current.firstChild;
    }

    return current;
  }
}

