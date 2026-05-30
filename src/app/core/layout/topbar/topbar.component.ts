import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal, HostListener, ElementRef, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, startWith } from 'rxjs';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {

  @Output() readonly toggleSidebar = new EventEmitter<void>();

  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly elementRef = inject(ElementRef);

  readonly isMenuOpen = signal(false);

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

  readonly userEmail = computed(() => {
    return this.authService.currentUser()?.username ?? '';
  });

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  emitToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  handleLogout(): void {
    this.closeMenu();
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isMenuOpen() && !this.elementRef.nativeElement.contains(target)) {
      this.closeMenu();
    }
  }

  private getLeafRoute(route: ActivatedRoute): ActivatedRoute {
    let current = route;

    while (current.firstChild) {
      current = current.firstChild;
    }

    return current;
  }
}

