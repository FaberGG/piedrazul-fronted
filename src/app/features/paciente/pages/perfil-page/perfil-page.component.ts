import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacientePerfil } from '../../models/paciente-perfil.model';
import { PacientePortalService } from '../../services/paciente-portal.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-page.component.html',
  styleUrl: './perfil-page.component.css'
})
export class PerfilPageComponent implements OnInit {
  private readonly portalService = inject(PacientePortalService);

  perfil = signal<PacientePerfil | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.portalService.getMiPerfil().subscribe({
      next: (data) => {
        this.perfil.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar tu perfil.');
        this.cargando.set(false);
      }
    });
  }
}
