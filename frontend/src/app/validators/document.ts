import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function documentValidator(tipoDocumentoControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const tipo = control.parent?.get(tipoDocumentoControlName)?.value;
    const valor = control.value;

    if (!tipo || !valor) {
      return null;
    }

    if (!/^\d+$/.test(valor)) {
      return { documentoPattern: true };
    }

    if (tipo === 'DNI' && valor.length !== 8) {
      return { documentoLongitud: '8' };
    }

    if (tipo === 'CNE' && valor.length !== 12) {
      return { documentoLongitud: '12' };
    }

    return null;
  };
}
