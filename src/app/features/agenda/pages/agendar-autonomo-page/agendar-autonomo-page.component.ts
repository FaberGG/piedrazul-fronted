import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../services/agenda.service';
import { MedicoResumen, AgendarAutonomoRequest, CitaResponse } from '../../models/agenda.models';

@Component({
  selector: 'app-agendar-autonomo-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendar-autonomo-page.component.html',
  styleUrl: './agendar-autonomo-page.component.css'
})
export class AgendarAutonomoPageComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);

  medicos = signal<MedicoResumen[]>([]);
  franjas = signal<string[]>([]);
  citaConfirmada = signal<CitaResponse | null>(null);

  medicoSeleccionado = signal<number | null>(null);
  fechaSeleccionada = signal<string>('');
  horaSeleccionada = signal<string>('');
  observaciones = signal<string>('');

  cargandoMedicos = signal(false);
  cargandoFranjas = signal(false);
  enviando = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.cargandoMedicos.set(true);
    this.agendaService.listarMedicosActivos().subscribe({
      next: (data) => {
        this.medicos.set(data);
        this.cargandoMedicos.set(false);
      },
      error: () => {
        this.error.set('Error al cargar médicos');
        this.cargandoMedicos.set(false);
      }
    });
  }

  onMedicoOFechaChange(): void {
    const medicoId = this.medicoSeleccionado();
    const fecha = this.fechaSeleccionada();
    if (!medicoId || !fecha) return;

    this.cargandoFranjas.set(true);
    this.horaSeleccionada.set('');
    this.agendaService.obtenerFranjasDisponibles(medicoId, fecha).subscribe({
      next: (data) => {
        this.franjas.set(data);
        this.cargandoFranjas.set(false);
      },
      error: () => {
        this.error.set('Error al cargar franjas');
        this.cargandoFranjas.set(false);
      }
    });
  }

  agendar(): void {
    const medicoId = this.medicoSeleccionado();
    const fecha = this.fechaSeleccionada();
    const hora = this.horaSeleccionada();

    if (!medicoId || !fecha || !hora) {
      this.error.set('Completa todos los campos obligatorios');
      return;
    }

    this.enviando.set(true);
    this.error.set(null);

    const request: AgendarAutonomoRequest = {
      medicoId,
      fecha,
      hora,
      observaciones: this.observaciones()
    };

    this.agendaService.agendarCita(request).subscribe({
      next: (cita) => {
        this.citaConfirmada.set(cita);
        this.enviando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Error al agendar la cita');
        this.enviando.set(false);
      }
    });
  }
}