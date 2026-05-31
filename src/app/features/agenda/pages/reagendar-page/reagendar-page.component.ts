import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AgendaManualService } from '../../services/agenda-manual.service';
import { AgendaService } from '../../services/agenda.service';
import { MedicosService } from '../../services/medicos.service';
import { CitaManualResponse } from '../../models/cita-manual.model';
import { HistorialCambiosCitaResponse, ReagendarCitaRequest } from '../../models/agenda.models';
import { CitaDetalleModel } from '../../models/cita.model';
import { MedicoModel } from '../../models/medico.model';

@Component({
  selector: 'app-reagendar-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reagendar-page.component.html',
  styleUrl: './reagendar-page.component.css'
})
export class ReagendarPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly agendaManualService = inject(AgendaManualService);
  private readonly agendaService = inject(AgendaService);
  private readonly medicosService = inject(MedicosService);

  citaId = signal<number | null>(null);
  citaDetalle = signal<CitaDetalleModel | null>(null);
  medicos = signal<MedicoModel[]>([]);
  franjasDisponibles = signal<string[]>([]);
  citaReagendada = signal<CitaManualResponse | null>(null);
  historial = signal<HistorialCambiosCitaResponse[]>([]);

  cargandoFranjas = signal(false);
  enviando = signal(false);
  submitted = signal(false);
  error = signal<string | null>(null);

  readonly form = this.fb.group({
    medicoId: [null as number | null, Validators.required],
    fecha: ['', Validators.required],
    hora: ['', Validators.required],
    motivo: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('citaId'));
    this.citaId.set(id);
    this.medicosService.listarActivos().subscribe({
      next: (data) => this.medicos.set(data),
      error: () => this.error.set('No se pudo cargar la lista de médicos.')
    });
    this.agendaManualService.obtenerDetalleCita(id).subscribe({
      next: (d) => this.citaDetalle.set(d),
      error: () => {}
    });
    this.agendaManualService.obtenerHistorialCita(id).subscribe({
      next: (h) => this.historial.set(h),
      error: () => {}
    });
  }

  onMedicoOFechaChange(): void {
    const medicoId = this.form.value.medicoId;
    const fecha = this.form.value.fecha;
    if (!medicoId || !fecha) return;

    this.cargandoFranjas.set(true);
    this.form.patchValue({ hora: '' });
    this.franjasDisponibles.set([]);

    this.agendaService.obtenerFranjasDisponibles(medicoId, fecha).subscribe({
      next: (franjas) => {
        this.franjasDisponibles.set(franjas);
        this.cargandoFranjas.set(false);
      },
      error: () => {
        this.error.set('Error al cargar franjas disponibles.');
        this.cargandoFranjas.set(false);
      }
    });
  }

  seleccionarFranja(franja: string): void {
    this.form.patchValue({ hora: franja });
    this.form.get('hora')?.markAsTouched();
  }

  reagendar(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.enviando.set(true);
    this.error.set(null);

    const v = this.form.value;
    const request: ReagendarCitaRequest = {
      nuevaFecha: v.fecha!,
      nuevaHora: v.hora!,
      motivo: v.motivo!,
      medicoNuevoId: v.medicoId ?? undefined
    };

    this.agendaManualService.reagendarCita(this.citaId()!, request).subscribe({
      next: (cita) => {
        this.citaReagendada.set(cita);
        this.enviando.set(false);
        // Recargar historial
        this.agendaManualService.obtenerHistorialCita(this.citaId()!).subscribe({
          next: (h) => this.historial.set(h)
        });
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Error al reagendar la cita.');
        this.enviando.set(false);
      }
    });
  }

  isInvalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c && c.invalid && (this.submitted() || c.touched));
  }

  volver(): void {
    this.router.navigate(['/agenda/listar']);
  }

  formatFecha(fecha: string): string {
    return fecha ? new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
  }

  formatHora(hora: string): string {
    return hora?.slice(0, 5) ?? '';
  }
}
