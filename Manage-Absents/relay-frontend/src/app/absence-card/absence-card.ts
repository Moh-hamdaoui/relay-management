import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Absence, User, Coverage } from '../models';

@Component({
  selector: 'app-absence-card',
  imports: [CommonModule],
  templateUrl: './absence-card.html',
  styleUrl: './absence-card.css',
  standalone: true,
})
export class AbsenceCard {
  @Input() absence!: Absence;
  @Input() user: User | null | undefined;
  @Input() coverages: Coverage[] = [];
  @Input() coverageUsers: User[] = [];
  @Input() currentUser: User | null = null;

  @Output() cardClick = new EventEmitter<Absence>();

  onCardClick() {
    this.cardClick.emit(this.absence);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getStatusIndicatorClass(absence: Absence): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(absence.start_date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(absence.end_date);
    endDate.setHours(0, 0, 0, 0);

    if (today >= startDate && today <= endDate) {
      // En cours - vert
      return 'bg-green-500';
    } else if (today > endDate) {
      // Passé - gris
      return 'bg-gray-400';
    } else {
      // À venir - bleu
      return 'bg-blue-500';
    }
  }

  getCoverageUserName(userId: string | number | null): string {
    if (userId == null || userId === '') {
      return 'Utilisateur inconnu';
    }

    const id = String(userId);
    if (this.currentUser && this.currentUser.id === id) {
      return 'Vous';
    }

    const user = this.coverageUsers.find(u => u.id === id);
    return user ? `${user.firstname} ${user.surname}` : 'Utilisateur inconnu';
  }
}

