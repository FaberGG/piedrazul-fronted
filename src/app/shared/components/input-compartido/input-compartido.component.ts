import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-compartido',
  imports: [CommonModule],
  templateUrl: './input-compartido.component.html',
  styleUrl: './input-compartido.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputCompartidoComponent),
      multi: true
    }
  ]
})
export class InputCompartidoComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() inputId = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() iconClass?: string;
  @Input() required = false;
  @Input() showTabHint = false;
  @Input() autocomplete = 'off';
  @Input() inputMode?: string;
  @Input() pattern?: string;
  @Input() maxLength?: number;
  @Input() min?: string;
  @Input() max?: string;
  @Input() invalid = false;
  @Input() errorMessage = '';

  @Output() readonly keyDown = new EventEmitter<KeyboardEvent>();
  @Output() readonly blurred = new EventEmitter<void>();
  @Output() readonly focused = new EventEmitter<void>();

  value = '';
  isDisabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
    this.blurred.emit();
  }

  onFocus(): void {
    this.focused.emit();
  }

  onKeyDown(event: KeyboardEvent): void {
    this.keyDown.emit(event);
  }
}

