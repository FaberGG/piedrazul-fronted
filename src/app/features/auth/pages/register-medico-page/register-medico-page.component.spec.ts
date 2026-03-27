import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarMedicoPageComponent } from './register-medico-page.component';

describe('RegistrarMedicoPageComponent', () => {
  let component: RegistrarMedicoPageComponent;
  let fixture: ComponentFixture<RegistrarMedicoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarMedicoPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarMedicoPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
