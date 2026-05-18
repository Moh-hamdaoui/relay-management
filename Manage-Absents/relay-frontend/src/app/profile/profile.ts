import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../auth-service';
import { ResponsibilityService } from '../responsibility';
import { Responsibility } from '../models/responsabiliy.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true,
  imports: [FormsModule],
})
export class ProfileComponent implements OnInit {
  user: any | null = null;
  responsibilities: Responsibility[] = [];

  newDescription: string = '';
  editingId: string | null = null;
  editDescription: string = '';

  constructor(
    private authService: AuthService,
    private respService: ResponsibilityService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getStoredUser();

    console.log('User ID:', this.user?.id);

    if (this.user?.id) {
      this.loadResponsibilities();
    }
  }

  loadResponsibilities(): void {
    this.respService.getResponsibilities(this.user!.id!).subscribe({
      next: (data: any) => {
        console.log('Responsibilities reçues:', data);

        this.responsibilities = Array.isArray(data)
          ? [...data]
          : [...(data.responsibilities || [])];

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur récupération responsibilities:', err);
      },
    });
  }

  addResponsibility(): void {
    const description = this.newDescription.trim();
    if (!description) return;

    this.respService.createResponsibility(this.user!.id!, description).subscribe({
      next: (newResp: Responsibility) => {
        this.responsibilities = [...this.responsibilities, newResp];
        this.newDescription = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur ajout responsibility:', err);
      },
    });
  }

  deleteResp(id: string | undefined): void {
    if (!id) return;

    this.respService.deleteResponsibility(this.user!.id!, id).subscribe({
      next: () => {
        this.responsibilities = this.responsibilities.filter(r => r.id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur suppression responsibility:', err);
      },
    });
  }

  startEdit(resp: Responsibility): void {
    if (!resp.id) return;

    this.editingId = resp.id;
    this.editDescription = resp.description;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editDescription = '';
  }

  saveEdit(id: string | undefined): void {
    const description = this.editDescription.trim();
    if (!id || !description) return;

    this.respService.updateResponsibility(this.user!.id!, id, description).subscribe({
      next: (updated: Responsibility) => {
        this.responsibilities = this.responsibilities.map(resp =>
          resp.id === id ? { ...resp, ...updated } : resp
        );

        this.editingId = null;
        this.editDescription = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur modification responsibility:', err);
      },
    });
  }
}