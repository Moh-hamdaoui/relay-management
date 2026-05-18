import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth-service';
import { DataService } from '../data.service';
import { Absence, User } from '../models';

@Component({
  selector: 'app-my-absences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-absences.html',
  styleUrl: './my-absences.css',
})
export class MyAbsences implements OnInit {
  currentUser: User | null = null;
  absences: Absence[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form = {
    startDate: '',
    endDate: '',
  };

  constructor(private authService: AuthService, private dataService: DataService) {}

  ngOnInit() {
    this.currentUser = this.authService.getStoredUser();
    if (this.currentUser) {
      this.loadMyAbsences();
    }
  }

  loadMyAbsences() {
    if (!this.currentUser) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.dataService.getUnavailabilitiesForUser(this.currentUser.id).subscribe({
      next: (absences) => {
        this.absences = absences;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Impossible de charger vos absences.';
        console.error(error);
        this.isLoading = false;
      },
    });
  }

  createAbsence() {
    if (!this.currentUser) {
      this.errorMessage = 'Vous devez être connecté pour déclarer une absence.';
      return;
    }
    if (!this.form.startDate || !this.form.endDate) {
      this.errorMessage = 'Veuillez préciser les dates de début et de fin.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.dataService
      .createAbsence(this.currentUser.id, {
        startDate: this.form.startDate,
        endDate: this.form.endDate,
      })
      .subscribe({
        next: (absence) => {
          this.absences = [absence, ...this.absences];
          this.form = { startDate: '', endDate: '' };
          this.successMessage = 'Absence déclarée avec succès.';
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Impossible de déclarer l’absence. Vérifiez les dates.';
          console.error(error);
          this.isLoading = false;
        },
      });
  }

  formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
}
