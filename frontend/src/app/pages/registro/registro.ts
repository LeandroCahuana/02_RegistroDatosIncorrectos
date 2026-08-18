import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserRequest } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { confirmPasswordValidator } from '../../validators/confirm-password';
import { documentValidator } from '../../validators/document';
import { sinNumerosValidator } from '../../validators/sin-numeros';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@_\.;:-])[A-Za-z\d@_\.;:-]+$/;

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

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
  readonly cargando = signal(false);
  readonly mensajeErrorServidor = signal<string | null>(null);

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
      contrasena: ['', [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_PATTERN)]],
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
    contrasenaPattern: 'Debe incluir al menos una mayúscula, una minúscula, un número y un símbolo (@ _ . ; : -).',
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
    this.mensajeErrorServidor.set(null);
    this.direccion.set('adelante');
    this.pasoActual.set(Math.min(3, this.pasoActual() + 1));
  }

  anterior(): void {
    this.enviado.set(false);
    this.mensajeErrorServidor.set(null);
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
      if (campo === 'paso3.contrasena') {
        return this.mensajes.contrasenaPattern;
      }
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
    this.mensajeErrorServidor.set(null);
    this.grupoPaso(3)?.markAllAsTouched();

    if (this.formulario.invalid || this.cargando()) {
      return;
    }

    const raw = this.formulario.getRawValue();
    const nombreCompleto = `${raw.paso1.nombre.trim()} ${raw.paso1.apellidos.trim()}`.trim();

    const usuario: UserRequest = {
      name: nombreCompleto,
      type_document: raw.paso1.tipoDocumento,
      number_document: raw.paso1.numeroDocumento.trim(),
      email: raw.paso2.correo.trim(),
      cellphone: raw.paso2.celular.trim(),
      age: Number(raw.paso2.edad),
      gender: raw.paso2.sexo === 'Masculino' ? 'M' : 'F',
      password: raw.paso3.contrasena,
    };

    this.cargando.set(true);

    this.userService.crearUsuario(usuario).subscribe({
      next: () => {
        this.cargando.set(false);
        this.exitoso.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        console.error('Error al registrar usuario:', err);

        if (err.error?.errors && typeof err.error.errors === 'object') {
          const firstKey = Object.keys(err.error.errors)[0];
          const errorMsg = err.error.errors[firstKey];
          this.mensajeErrorServidor.set(errorMsg || 'Error de validación en los datos ingresados.');
        } else if (err.error?.message) {
          this.mensajeErrorServidor.set(err.error.message);
        } else if (err.status === 0) {
          this.mensajeErrorServidor.set('No se pudo conectar con el servidor backend (http://localhost:8081). Verifica que esté encendido.');
        } else {
          this.mensajeErrorServidor.set(`Error del servidor (${err.status}): ${err.statusText || 'No se pudo completar el registro'}`);
        }
      },
    });
  }
}

