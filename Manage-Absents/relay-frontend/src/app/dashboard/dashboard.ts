import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbsenceCard } from '../absence-card/absence-card';
import { AbsenceDetailModal } from '../absence-detail-modal/absence-detail-modal';
import { AuthService } from '../auth-service';
import { Absence, User, Coverage, Responsibility } from '../models';
import { DataService } from '../data.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, AbsenceCard, AbsenceDetailModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  standalone: true,
})
export class Dashboard implements OnInit {
  isLoading = true;
  activeTab: 'present' | 'past' | 'future' | 'all' = 'all';
  selectedAbsence: Absence | null = null;

  absences: Absence[] = [];
  users: User[] = [];
  coverages: Coverage[] = [];
  responsibilities: Responsibility[] = [];
  currentUser: User | null = null;

  tabData = [
    { label: 'Toutes', value: 'all' as const, count: 0 },
    { label: 'En cours', value: 'present' as const, count: 0 },
    { label: 'Passées', value: 'past' as const, count: 0 },
    { label: 'À venir', value: 'future' as const, count: 0 },
  ];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('Dashboard ngOnInit called');
    this.currentUser = this.authService.getStoredUser();
    console.log('Current user:', this.currentUser);
    if (this.currentUser) {
      this.loadData();
    }
  }

  loadData() {
    console.log('Loading data...');
    this.isLoading = true;

    this.dataService.loadAllData().subscribe({
      next: ({ users, absences, responsibilities, coverages }) => {
        this.users = users;
        this.absences = absences;
        this.responsibilities = responsibilities;
        this.coverages = coverages;
        this.updateTabCounts();
        this.isLoading = false;
        this.cdr.detectChanges();

        console.log('Data loaded:', {
          absences: this.absences.length,
          users: this.users.length,
          responsibilities: this.responsibilities.length,
          coverages: this.coverages.length,
          isLoading: this.isLoading,
        });
          console.log('activeList after load:', this.activeList.length); // ← ajoute ça

      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateTabCounts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.tabData[0].count = this.absences.length;
    this.tabData[1].count = this.absences.filter(a => this.isPresentAbsence(a, today)).length;
    this.tabData[2].count = this.absences.filter(a => this.isPastAbsence(a, today)).length;
    this.tabData[3].count = this.absences.filter(a => this.isFutureAbsence(a, today)).length;
  }

  setActiveTab(tab: 'all' | 'present' | 'past' | 'future') {
    this.activeTab = tab;
  }

  get activeList(): Absence[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.activeTab === 'all') return this.absences;
    if (this.activeTab === 'present') return this.absences.filter(a => this.isPresentAbsence(a, today));
    if (this.activeTab === 'past') return this.absences.filter(a => this.isPastAbsence(a, today));
    if (this.activeTab === 'future') return this.absences.filter(a => this.isFutureAbsence(a, today));
    return this.absences;
  }

  /**
   * Vérifie si une absence est en cours (présent)
   */
  isPresentAbsence(absence: Absence, today: Date): boolean {
    const startDate = new Date(absence.start_date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(absence.end_date);
    endDate.setHours(0, 0, 0, 0);
    
    return today >= startDate && today <= endDate;
  }

  /**
   * Vérifie si une absence est passée
   */
  isPastAbsence(absence: Absence, today: Date): boolean {
    const endDate = new Date(absence.end_date);
    endDate.setHours(0, 0, 0, 0);
    
    return today > endDate;
  }

  /**
   * Vérifie si une absence est à venir
   */
  isFutureAbsence(absence: Absence, today: Date): boolean {
    const startDate = new Date(absence.start_date);
    startDate.setHours(0, 0, 0, 0);
    
    return today < startDate;
  }

  getUser(userId: string): User | null {
    return this.users.find(u => u.id === userId) || null;
  }

  getCoveragesForAbsence(absenceId: string): Coverage[] {
    return this.coverages.filter(c => c.unavailability_id === absenceId);
  }

  selectAbsence(absence: Absence) {
    this.selectedAbsence = absence;
  }

  closeModal() {
    this.selectedAbsence = null;
  }

  onCoverageUpdated() {
    // TODO: Recharger les données après mise à jour d'une couverture
    this.loadData();
  }

  logout() {
    this.authService.logout();
  }

  /**
   * Retourne les responsabilités d'un utilisateur
   */
  getUserResponsibilities(userId: string): Responsibility[] {
    return this.responsibilities.filter(r => r.user_id === userId);
  }

  /**
   * Vérifie si l'utilisateur connecté peut assigner des responsabilités pour cette absence
   */
  canAssignResponsibilities(absence: Absence): boolean {
    return this.currentUser !== null && this.currentUser.id === absence.user_id;
  }
}
