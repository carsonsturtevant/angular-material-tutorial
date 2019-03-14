import { Component } from '@angular/core';
import { DataService } from '../data/data.service';
import { Post } from '../Post';
import { DataSource } from '@angular/cdk/table';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth.service';
import { PostDialogComponent } from '../post-dialog/post-dialog.component';
import { MatDialog } from '@angular/material';
import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { Validators } from "@angular/forms";
import { startWith } from 'rxjs/operators/startWith';
import { MatStepper } from '@angular/material';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private dataService: DataService, private formBuilder: FormBuilder, public auth: AuthService, public dialog: MatDialog) {
  }

  displayedColumns = ['date_posted', 'title', 'category', 'delete'];
  dataSource = new PostDataSource(this.dataService);

  calories: number;
  carbohydrates: number;
  fats: number;
  proteins: number;

  everythingIsGood = false;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;
  fifthFormGroup: FormGroup;
  sixthFormGroup: FormGroup;

  mOrFs: string[] = [
    "Male",
    "Female"
  ];
  filteredMOrFs: Observable<string[]>;
  mOrF = new FormControl(Validators.required);
  selectedMOrF: string;

  weightGoals: string[] = [
    "Gain",
    "Lose",
    "Maintain"
  ];
  filteredWeightGoals: Observable<string[]>;
  weightGoal = new FormControl(Validators.required);
  selectedWeightGoal: string;

  activityLevels: string[] = [
    "Sedentary",
    "Lightly Active",
    "Moderately Active",
    "Very Active",
    "Extremely Active"
  ];
  filteredActivityLevels: Observable<string[]>;
  activityLevel = new FormControl(Validators.required);
  selectedActivityLevel: string;

  ngOnInit() {
    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['', Validators.pattern('[0-9]+\.?[0-9]?')]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.pattern('[0-9]+\.?[0-9]?')]
    });
    this.thirdFormGroup = this.formBuilder.group({
      thirdCtrl: ['', Validators.pattern('[0-9]+')]
    });
    this.fourthFormGroup = this.formBuilder.group({
      fourthCtrl: ['', Validators.pattern('(Male|Female)')]
    },{
      'mOrF': this.mOrF
    });
    this.fifthFormGroup = this.formBuilder.group({
      fifthCtrl: ['', Validators.pattern('(Gain|Lose|Maintain)')]
    },{
      'weightGoal': this.weightGoal
    });
    this.sixthFormGroup = this.formBuilder.group({
      sixthCtrl: ['', Validators.pattern('(Sedentary|Lightly Active|Moderately Active|Very Active|Extremely Active)')]
    },{
      'activityLevel': this.activityLevel
    });

    this.filteredMOrFs = this.initializeMOrFFilter();
    this.filteredWeightGoals = this.initializeWeightGoalFilter();
    this.filteredActivityLevels = this.initializeActivityLevelFilter();

  }

  initializeActivityLevelFilter(): Observable<string[]> {
    return this.activityLevel.valueChanges.pipe(
      startWith<string[]>([""],
      this.activityLevels)
    );
  }

  initializeWeightGoalFilter(): Observable<string[]> {
    return this.weightGoal.valueChanges.pipe(
      startWith<string[]>([""],
      this.weightGoals)
    );
  }

  initializeMOrFFilter(): Observable<string[]> {
    return this.mOrF.valueChanges.pipe(
      startWith<string[]>([""],
      this.mOrFs)
    );
  }

  displayMOrF(mOrF?: string): string | undefined {
    return mOrF ? mOrF : undefined;
  }

  displayWeightGoal(weightGoal?: string): string | undefined {
    return weightGoal ? weightGoal : undefined;
  }

  displayActivityLevel(activityLevel?: string): string | undefined {
    return activityLevel ? activityLevel : undefined;
  }

  calculateMacros() {
    var height = this.firstFormGroup.controls['firstCtrl'].value;
    var weight = this.secondFormGroup.controls['secondCtrl'].value;
    var age = this.thirdFormGroup.controls['thirdCtrl'].value;
    var sex = this.fourthFormGroup.controls['fourthCtrl'].value;
    var weightGoal = this.fifthFormGroup.controls['fifthCtrl'].value;
    var activityLevel = this.sixthFormGroup.controls['sixthCtrl'].value;

    if(!height || !weight || !age || !sex || !weightGoal || !activityLevel) {
      this.everythingIsGood = false;
      return;
    }
    //bmr
    var bmr = 0;
    if(sex === "Male") {
      bmr = 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age);
    } else {
      bmr = 655 + (4.35 * weight) + (4.7 * height) - (4.7 * age);
    }
    
    //calories
    switch(activityLevel) {
      case "Sedentary": {
        this.calories = Math.round(bmr*1.2);
        break;
      }
      case "Lightly Active": {
        this.calories = Math.round(bmr*1.375);
        break;
      }
      case "Moderately Active": {
        this.calories = Math.round(bmr*1.55);
        break;
      }
      case "Very Active": {
        this.calories = Math.round(bmr*1.725);
        break;
      }
      case "Extremely Active": {
        this.calories = Math.round(bmr*1.9);
        break;
      }
    }

    switch(weightGoal) {
      case "Gain": {
        this.calories += 500;
        break;
      }
      case "Lose": {
        this.calories -= 500;
        break;
      }
    }

    var remainingCals = this.calories;

    //protein 1g/lb bodyweight
    this.proteins = Math.round(weight);
    remainingCals -= (weight*4);

    //fats 25% daily caloric intake
    this.fats = Math.round((this.calories*.25)/9);
    remainingCals -= (this.fats*9);

    //carbs are remainingCals
    this.carbohydrates = Math.round(remainingCals/4);

    this.everythingIsGood = true;
    
  }

  reset(stepper: MatStepper) {
    this.selectedActivityLevel = null;
    this.selectedMOrF = null;
    this.selectedWeightGoal = null;
    this.filteredActivityLevels = this.initializeActivityLevelFilter();
    this.filteredMOrFs = this.initializeMOrFFilter();
    this.filteredWeightGoals = this.initializeWeightGoalFilter();
    this.calories = null;
    this.carbohydrates = null;
    this.fats = null;
    this.proteins = null;
    this.everythingIsGood = false;
    stepper.reset();
  }

  deletePost(id) {
    if (this.auth.isAuthenticated()) {
      this.dataService.deletePost(id);
      this.dataSource = new PostDataSource(this.dataService);
    } else {
      alert('Login in Before');
    }
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(PostDialogComponent, {
      width: '600px',
      data: 'Add Post'
    });
    dialogRef.componentInstance.event.subscribe((result) => {
      this.dataService.addPost(result.data);
      this.dataSource = new PostDataSource(this.dataService);
    });
  }

}

export class PostDataSource extends DataSource<any> {
  constructor(private dataService: DataService) {
    super();
  }

  connect(): Observable<Post[]> {
    return this.dataService.getData();
  }

  disconnect() {
  }
}