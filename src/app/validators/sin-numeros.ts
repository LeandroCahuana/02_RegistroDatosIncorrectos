import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const sinNumerosValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }
  return /\d/.test(control.value) ? { sinNumeros: true } : null;
};
