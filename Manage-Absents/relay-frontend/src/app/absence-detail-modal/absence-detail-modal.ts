import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { Absence, User, Coverage, Responsibility } from '../models';

@Component({
  selector: 'app-absence-detail-modal',
  imports: [CommonModule],
  templateUrl: './absence-detail-modal.html',
  styleUrl: './absence-detail-modal.css',
  standalone: true,
})
export class AbsenceDetailModal {
  @Input() open = false;
  @Input() absence: Absence | null = null;
  @Input() absenceUser: User | null = null;
  @Input() coverages: Coverage[] = [];
  @Input() responsibilities: Responsibility[] = [];
  @Input() users: User[] = [];
  @Input() currentUser: User | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() coverageUpdated = new EventEmitter<void>();

  constructor(private dataService: DataService) {}

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }

  onCloseModal() {
    this.closeModal.emit();
  }

  getStatusClasses(absence: Absence): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(absence.start_date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(absence.end_date);
    endDate.setHours(0, 0, 0, 0);

    if (today >= startDate && today <= endDate) {
      // En cours - vert
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (today > endDate) {
      // Passé - gris
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    } else {
      // À venir - bleu
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  }

  getStatusText(absence: Absence): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(absence.start_date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(absence.end_date);
    endDate.setHours(0, 0, 0, 0);

    if (today >= startDate && today <= endDate) {
      return 'En cours';
    } else if (today > endDate) {
      return 'Passé';
    } else {
      return 'À venir';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getCurrentCoverage(responsibilityId: string): string {
    const coverage = this.coverages.find(c => c.responsibility_id === responsibilityId);
    return coverage?.covering_user_id || '';
  }

  updateCoverage(responsibilityId: string, event: Event) {
    if (this.isPastAbsence()) {
      return;
    }

    const target = event.target as HTMLSelectElement;
    const coveringUserId = target.value;

    if (!this.absence) {
      return;
    }

    const coverage = this.coverages.find((c) => c.responsibility_id === responsibilityId);

    if (coveringUserId) {
      const coveragePayload = {
        responsibilityId: responsibilityId,
        coveringUserId: coveringUserId,
      };

      this.dataService
        .createCoverage(this.absence.user_id, this.absence.id, coveragePayload)
        .subscribe({
          next: () => {
            this.coverageUpdated.emit();
          },
          error: (err) => {
            console.error('Error creating coverage:', err);
          },
        });
    } else if (coverage) {
      this.dataService.deleteCoverage(this.absence.user_id, this.absence.id, coverage.id).subscribe({
        next: () => {
          this.coverageUpdated.emit();
        },
        error: (err) => {
          console.error('Error deleting coverage:', err);
        },
      });
    }
  }

  removeCoverage(coverageId: string) {
    if (!this.absence || this.isPastAbsence()) {
      return;
    }
    const coverage = this.coverages.find((c) => c.id === coverageId);
    if (!coverage) return;
    if (coverage.covering_user_id !== this.currentUser?.id) return;

    this.dataService.deleteCoverage(this.absence.user_id, this.absence.id, coverageId).subscribe({
      next: () => {
        this.coverageUpdated.emit();
      },
      error: (err) => {
        console.error('Error deleting coverage:', err);
      },
    });
  }

  assignToSelf(responsibilityId: string) {
    if (!this.absence || !this.currentUser || this.isPastAbsence()) return;
    const existing = this.coverages.find((c) => c.responsibility_id === responsibilityId);
    if (existing) return;
    const coveragePayload = {
      responsibilityId: responsibilityId,
      coveringUserId: this.currentUser.id,
    };
    this.dataService
      .createCoverage(this.absence.user_id, this.absence.id, coveragePayload)
      .subscribe({
        next: () => {
          this.coverageUpdated.emit();
        },
        error: (err) => {
          console.error('Error creating coverage:', err);
        },
      });
  }

  getCoverageIdForResponsibility(responsibilityId: string): string | null {
    const coverage = this.coverages.find((c) => c.responsibility_id === responsibilityId);
    return coverage ? coverage.id : null;
  }

  getUserName(userId: string | null): string {
    if (!userId) {
      return 'Utilisateur inconnu';
    }
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.firstname} ${user.surname}` : 'Utilisateur inconnu';
  }

  getResponsibilityName(responsibilityId: string): string {
    const responsibility = this.responsibilities.find(r => r.id === responsibilityId);
    return responsibility?.description || 'Responsabilité inconnue';
  }

  canApproveOrReject(): boolean {
    // L'utilisateur peut gérer les couvertures s'il est connecté, n'est pas l'utilisateur absent, et que l'absence n'est pas passée
    return !!(this.currentUser && this.absence && !this.isPastAbsence() && this.currentUser.id !== this.absence.user_id);
  }

  isPastAbsence(): boolean {
    if (!this.absence) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(this.absence.end_date);
    endDate.setHours(0, 0, 0, 0);
    return today > endDate;
  }

  canAssignTasks(): boolean {
    // Permet d'assigner les tâches si l'utilisateur courant n'est pas l'utilisateur absent et que l'absence n'est pas passée
    return !!(this.currentUser && this.absence && !this.isPastAbsence() && this.currentUser.id !== this.absence.user_id);
  }

  getAbsenceResponsibilities(): Responsibility[] {
    // Retourne toutes les responsabilités de l'utilisateur absent
    if (!this.absence) return [];
    return this.responsibilities.filter(r => r.user_id === this.absence!.user_id);
  }

  getUncoveredResponsibilities(): Responsibility[] {
    const responsibilities = this.getAbsenceResponsibilities();
    return responsibilities.filter((responsibility) => {
      return !this.coverages.some((coverage) => coverage.responsibility_id === responsibility.id);
    });
  }

  approveAbsence() {
    if (this.absence) {
      // TODO: Appeler l'API pour approuver l'absence
      console.log(`Approuver absence ${this.absence.id}`);
      this.coverageUpdated.emit();
      this.closeModal.emit();
    }
  }

  rejectAbsence() {
    if (this.absence) {
      // TODO: Appeler l'API pour refuser l'absence
      console.log(`Refuser absence ${this.absence.id}`);
      this.coverageUpdated.emit();
      this.closeModal.emit();
    }
  }
}
