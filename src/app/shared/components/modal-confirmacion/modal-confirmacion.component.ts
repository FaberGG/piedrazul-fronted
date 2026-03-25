import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-confirmacion',
  imports: [CommonModule],
  templateUrl: './modal-confirmacion.component.html',
  styleUrl: './modal-confirmacion.component.css'
})
export class ModalConfirmacionComponent {
  @Input() visible = false;
  @Input() titulo = 'Confirmacion';
  @Input() mensaje = '';
  @Input() detalleLineas: string[] = [];
  @Input() textoConfirmar = 'Confirmar';
  @Input() textoCancelar = 'Cancelar';

  @Output() readonly confirmar = new EventEmitter<void>();
  @Output() readonly cancelar = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancelar.emit();
    }
  }
}

