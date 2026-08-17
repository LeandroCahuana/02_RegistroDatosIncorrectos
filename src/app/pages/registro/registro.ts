import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { confirmPasswordValidator } from '../../validators/confirm-password';
import { documentValidator } from '../../validators/document';
import { sinNumerosValidator } from '../../validators/sin-numeros';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly fb = inject(FormBuilder);

  readonly tiposDocumento = ['DNI', 'CNE'];

  readonly sexos = ['Masculino', 'Femenino'];

  readonly pasos = [
    { numero: 1, titulo: 'Información personal' },
    { numero: 2, titulo: 'Contacto y edad' },
    { numero: 3, titulo: 'Seguridad de la cuenta' },
  ];

  readonly pasoActual = signal(1);
  readonly direccion = signal<'adelante' | 'atras'>('adelante');
  readonly enviado = signal(false);
  readonly exitoso = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    paso1: this.fb.nonNullable.group({
      nombre: ['', [Validators.required, sinNumerosValidator]],
      apellidos: ['', [Validators.required, sinNumerosValidator]],
      tipoDocumento: ['', [Validators.required]],
      numeroDocumento: ['', [Validators.required, documentValidator('tipoDocumento')]],
    }),
    paso2: this.fb.nonNullable.group({
      correo: ['', [Validators.required, Validators.email]],
      celular: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      sexo: ['', [Validators.required]],
    }),
    paso3: this.fb.nonNullable.group({
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', [Validators.required, confirmPasswordValidator('contrasena')]],
      aceptaTerminos: [false, [Validators.requiredTrue]],
      aceptaPrivacidad: [false, [Validators.requiredTrue]],
    }),
  });

  readonly mensajes = {
    requerido: 'Este campo es obligatorio.',
    correo: 'Ingresa un correo válido.',
    documentoPattern: 'Ingresa solo números.',
    documentoLongitud: (len: string) => `Debe tener exactamente ${len} dígitos.`,
    celular: 'Ingresa un celular válido (debe comenzar con 9 y tener 9 dígitos).',
    edad: 'Debes tener entre 18 y 99 años.',
    contrasena: 'Mínimo 8 caracteres.',
    confirmar: 'Las contraseñas no coinciden.',
    terminos: 'Debes aceptar los términos y condiciones.',
    privacidad: 'Debes aceptar la política de privacidad.',
    sinNumeros: 'No se permiten números en este campo.',
  };

  constructor() {
    this.formulario.get('paso3.contrasena')?.valueChanges.subscribe(() => {
      this.formulario.get('paso3.confirmarContrasena')?.updateValueAndValidity();
    });

    this.formulario.get('paso1.tipoDocumento')?.valueChanges.subscribe(() => {
      this.formulario.get('paso1.numeroDocumento')?.updateValueAndValidity();
    });
  }

  grupoPaso(numero: number): AbstractControl | null {
    return this.formulario.get(`paso${numero}`);
  }

  siguiente(): void {
    const grupo = this.grupoPaso(this.pasoActual());
    grupo?.markAllAsTouched();
    if (!grupo || grupo.invalid) {
      return;
    }
    this.enviado.set(false);
    this.direccion.set('adelante');
    this.pasoActual.set(Math.min(3, this.pasoActual() + 1));
  }

  anterior(): void {
    this.enviado.set(false);
    this.direccion.set('atras');
    this.pasoActual.set(Math.max(1, this.pasoActual() - 1));
  }

  mostrarError(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty || this.enviado());
  }

  mensaje(campo: string): string {
    const control = this.formulario.get(campo);
    if (!control) {
      return '';
    }
    if (control.hasError('required')) {
      return this.mensajes.requerido;
    }
    if (control.hasError('email')) {
      return this.mensajes.correo;
    }
    if (control.hasError('documentoPattern')) {
      return this.mensajes.documentoPattern;
    }
    if (control.hasError('documentoLongitud')) {
      const len = control.getError('documentoLongitud');
      return this.mensajes.documentoLongitud(len);
    }
    if (control.hasError('pattern')) {
      return this.mensajes.celular;
    }
    if (control.hasError('min') || control.hasError('max')) {
      return this.mensajes.edad;
    }
    if (control.hasError('minlength')) {
      return this.mensajes.contrasena;
    }
    if (control.hasError('passwordMismatch')) {
      return this.mensajes.confirmar;
    }
    if (control.hasError('sinNumeros')) {
      return this.mensajes.sinNumeros;
    }
    if (campo === 'paso3.aceptaTerminos') {
      return this.mensajes.terminos;
    }
    if (campo === 'paso3.aceptaPrivacidad') {
      return this.mensajes.privacidad;
    }
    return '';
  }

  enviar(): void {
    this.enviado.set(true);
    this.grupoPaso(3)?.markAllAsTouched();
    if (this.formulario.invalid) {
      return;
    }
    this.exitoso.set(true);
    console.log('Datos de registro:', this.formulario.getRawValue());
  }
}
