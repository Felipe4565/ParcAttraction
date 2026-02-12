import { Component } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { AttractionInterface } from '../Interface/attraction.interface';
import { AttractionService } from '../Service/attraction.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatButtonModule, MatCardModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

  public formulaireAttractions: FormGroup[] = [];

  constructor(
    public attractionService: AttractionService,
    public formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private router: Router,
  )
  {}
  
  public attractions: Observable<AttractionInterface[]> = this.attractionService.getAllAttractionAdmin().pipe(
    tap((attractions:AttractionInterface[]) => {
      this.formulaireAttractions = [];
      attractions.forEach(attraction => {
        this.formulaireAttractions.push(
          new FormGroup({
            attraction_id: new FormControl(attraction.attraction_id),
            nom: new FormControl(attraction.nom, [Validators.required]),
            description: new FormControl(attraction.description, [Validators.required]),
            difficulte: new FormControl(attraction.difficulte),
            visible: new FormControl(attraction.visible)
          })
        );
      });
    }),
    catchError((err) => {
      const status = err?.status;
      if (status === 401) {
        this._snackBar.open('Session expirée : reconnectez-vous.', undefined, { duration: 2000 });
        this.router.navigate(['/login']);
        return of([] as AttractionInterface[]);
      }
      this._snackBar.open('Erreur lors du chargement des attractions.', undefined, { duration: 2000 });
      return of([] as AttractionInterface[]);
    })
  );

  public onSubmit(attractionFormulaire: FormGroup) {
    console.log(attractionFormulaire)
    this.attractionService.postAttraction(attractionFormulaire.getRawValue()).subscribe(result => {
      attractionFormulaire.patchValue({attraction_id: result.result});
      this._snackBar.open(result.message, undefined, {
        duration: 1000
      });
    });
  }

  public addAttraction() {
    this.formulaireAttractions.push(
      new FormGroup({
        attraction_id: new FormControl(),
        nom: new FormControl("", [Validators.required]),
        description: new FormControl("", [Validators.required]),
        difficulte: new FormControl(),
        visible: new FormControl(true)
      })
    );
  }
}
