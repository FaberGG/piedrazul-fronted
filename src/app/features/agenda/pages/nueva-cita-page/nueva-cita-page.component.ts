import { Component, signal } from '@angular/core';

import { FormularioPacienteComponent } from '../../components/formulario-paciente/formulario-paciente.component';
import { SelectorHorarioComponent } from '../../components/selector-horario/selector-horario.component';
import { CitaManualResponse, PacienteFormulario } from '../../models/cita-manual.model';

@Component({
  selector: 'app-nueva-cita-page',
  imports: [FormularioPacienteComponent, SelectorHorarioComponent],
  templateUrl: './nueva-cita-page.component.html',
  styleUrl: './nueva-cita-page.component.css'
})
export class NuevaCitaPageComponent {
  readonly paciente = signal<PacienteFormulario | null>(null);
  readonly pacienteValido = signal(false);
  readonly mensaje = signal('');
  readonly resetKey = signal(0);

  onPacienteChange(evento: { paciente: PacienteFormulario; valido: boolean }): void {
    this.paciente.set(evento.paciente);
    this.pacienteValido.set(evento.valido);
  }

  onCitaCreada(cita: CitaManualResponse): void {
    this.mensaje.set(`Cita creada para ${cita.pacienteNombre} a las ${cita.hora}.`);
    this.reiniciarFlujo();
  }

  onCancelado(): void {
    this.mensaje.set('Se cancelo el flujo de agendamiento de cita.');
    this.reiniciarFlujo();
  }

  private reiniciarFlujo(): void {
    this.paciente.set(null);
    this.pacienteValido.set(false);
    this.resetKey.update((value) => value + 1);
  }
}

