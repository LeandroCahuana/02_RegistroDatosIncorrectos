import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function confirmPasswordValidator(passwordControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.parent?.get(passwordControlName)?.value;
    if (password === undefined || password === null) {
      return null;
    }
    return password === control.value ? null : { passwordMismatch: true };
  };
}
