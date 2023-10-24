import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { 
  FormGroup, 
  FormBuilder, 
  FormControl, 
  FormArray, 
  FormGroupDirective, 
  Validators, 
  AbstractControl, 
  ValidatorFn, 
  AsyncValidatorFn, 
  ValidationErrors 
} from "@angular/forms";
import { Observable, of, Subject } from 'rxjs';
import { map, catchError, delay, tap, takeUntil } from 'rxjs/operators';

import { UserService } from './user.service';

const nameValidators = (): ValidatorFn[] => [
  Validators.required,
  Validators.minLength(4),
  Validators.maxLength(20)
];

/**
 * AppComponent serves as the primary component for the `fe-form` application.
 * This component provides an interface for collecting and submitting user information.
 * Features include collecting basic personal data, framework expertise, and hobbies.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  title = 'fe-form';

  public isSubmitted: boolean = false;
  public engineerForm!: FormGroup;

  private destroy$ = new Subject<void>();

  /**
   * A reference to the `userForm` template within the component's view.
   * This allows for direct interaction with the form's underlying `FormGroupDirective`.
   */
  @ViewChild('userForm', { static: false }) formReference?: FormGroupDirective;

  frameworks: string[] = ['angular', 'react', 'vue'];
  frameworkVersions: { [key: string]: string[] } = {
    angular: ['1.1.1', '1.2.1', '1.3.3'],
    react: ['2.1.2', '3.2.4', '4.3.1'],
    vue: ['3.3.1', '5.2.1', '5.1.3'],
  };

  constructor(private formBuilder: FormBuilder, private userService: UserService) {}
   
  /** Initialize the form controls and set up validation rules */
  ngOnInit(): void {
    this.engineerForm = this.formBuilder.group({
      firstName: ['', nameValidators()],
      lastName: ['', nameValidators()],
      dateOfBirth: ['', [Validators.required, this.ageValidator(18, 100)]],
      framework: ['', Validators.required],
      frameworkVersion: [{value: '', disabled: true}, Validators.required],
      email: ['', [Validators.required, Validators.email], [this.emailAsyncValidator(this.userService)]],
      hobbies: this.formBuilder.array([
        this.formBuilder.control('', nameValidators())
      ])
    });
  }

  /** Enable framework versions input */
  public enableVersion(): void {
    this.engineerForm.get('frameworkVersion')?.enable();
  }

  /** Getter for hobbies FormArray */
  get hobbies(): FormArray {
    return this.engineerForm.get('hobbies') as FormArray;
  }
  
  /** Add new hobby control to the hobbies FormArray */
  addHobby(): void {
    const hobby = new FormControl('', nameValidators());
    this.hobbies.push(hobby);
  }

  /** 
   * Remove a specific hobby control from the hobbies FormArray 
   * 
   * @param index The index of the hobby to remove
   */
  removeHobby(index: number): void {
    this.hobbies.removeAt(index);
  }

  /**
   * Provides an async validator for email field to check if the email already exists
   * 
   * @param userService Service used to check email existence
   * 
   * @returns Async validator function
   */
  emailAsyncValidator(userService: UserService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return userService.checkEmailExists(control.value).pipe(
        map(isEmailTaken => (isEmailTaken ? { emailTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  /** 
   * Custom validator for age.
   * Checks if the age is within the provided range.
   * 
   * @param {number} min - Minimum age.
   * 
   * @param {number} max - Maximum age.
   * 
   * @return {ValidatorFn} - Validator function.
   */
  ageValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): {[key: string]: boolean} | null => {
      if (!control.value) {
        return null;
      }
      const birthYear = new Date(control.value).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;

      if (age < min || age > max) {
        return {'ageRange': true};
      }
      return null;
    };
  }

  /** Handle form submission. If form is valid, the user's data is submitted */
  onSubmit(): void {
    if (this.engineerForm.valid) {
        this.userService.addUser(this.engineerForm.value).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: () => {
                this.isSubmitted = true; 
                of(null).pipe(
                    delay(3000),
                    tap(() => {
                        this.isSubmitted = false;
                        this.formReference?.resetForm();
                        this.hobbies.clear();
                    }),
                    takeUntil(this.destroy$)
                ).subscribe();
            }
        });
    }
  }
  
  /** Lifecycle method that is called when the component is destroyed */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}