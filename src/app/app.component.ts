import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators, AbstractControl, ValidatorFn } from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'fe-form';

  public isSubmitted: boolean = false;
  public engineerForm!: FormGroup;
  public frameworks: string[] = ['angular', 'react', 'vue'];
  public frameworkVersions: { [key: string]: string[] } = {
    angular: ['1.1.1', '1.2.1', '1.3.3'],
    react: ['2.1.2', '3.2.4', '4.3.1'],
    vue: ['3.3.1', '5.2.1', '5.1.3'],
  };

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    /**Initialize the form with controls and validation */
    this.engineerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      dateOfBirth: ['', [Validators.required, ageValidator(18, 100)]],
      framework: ['', Validators.required],
      frameworkVersion: [{value: '', disabled: true}, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      hobbies: this.formBuilder.array([this.formBuilder.control('', [Validators.required, Validators.minLength(4), Validators.maxLength(20)])])
    });
  }

  /**Enable framework versions input */
  public enableVersion() {
    this.engineerForm.get('frameworkVersion')?.enable();
  }

  get hobbies() {
    return this.engineerForm.get('hobbies') as FormArray;
  }
  
  /**Add new hobby control to the hobbies FormArray */
  addHobby() {
    const hobby = new FormControl('', [
      Validators.required, 
      Validators.minLength(4), 
      Validators.maxLength(20)
    ]);
    this.hobbies.push(hobby);
  }

  /**Remove a hobby control from the hobbies FormArray */
  removeHobby(index: number) {
    this.hobbies.removeAt(index);
  }

  onSubmit() {
    console.log(this.engineerForm.value);
    this.isSubmitted = true;
  }
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
function ageValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): {[key: string]: boolean} | null => {
    if (!control.value) {
      return null;
    }
    const birthDate = new Date(control.value).getTime();
    const currentDate = Date.now();
    const age = Math.floor((currentDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

    if (age < min || age > max) {
      return {'ageRange': true};
    }
    return null;
  };
}