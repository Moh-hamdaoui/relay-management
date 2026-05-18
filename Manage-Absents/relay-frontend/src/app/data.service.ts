import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { Absence, Coverage, Responsibility, User } from './models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'http://localhost:3000';

  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  private absencesSubject = new BehaviorSubject<Absence[]>([]);
  absences$ = this.absencesSubject.asObservable();

  private responsibilitiesSubject = new BehaviorSubject<Responsibility[]>([]);
  responsibilities$ = this.responsibilitiesSubject.asObservable();

  private coveragesSubject = new BehaviorSubject<Coverage[]>([]);
  coverages$ = this.coveragesSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadAllData(): Observable<{ users: User[]; absences: Absence[]; responsibilities: Responsibility[]; coverages: Coverage[] }> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      tap((users) => this.usersSubject.next(users)),
      switchMap((users) => {
        const absenceRequests = users.map((user) => this.getUnavailabilitiesForUser(user.id));
        const responsibilityRequests = users.map((user) => this.getResponsibilitiesForUser(user.id));

        return forkJoin({
          absences: absenceRequests.length ? forkJoin(absenceRequests).pipe(map((results) => results.flat())) : of([] as Absence[]),
          responsibilities: responsibilityRequests.length ? forkJoin(responsibilityRequests).pipe(map((results) => results.flat())) : of([] as Responsibility[]),
        }).pipe(
          map(({ absences, responsibilities }) => ({ users, absences, responsibilities }))
        );
      }),
      switchMap(({ users, absences, responsibilities }) => {
        this.absencesSubject.next(absences);
        this.responsibilitiesSubject.next(responsibilities);

        const validAbsenceRequests = absences.map((absence) =>
          this.getCoveragesForAbsence(absence.user_id, absence.id)
        );

        return validAbsenceRequests.length
          ? forkJoin(validAbsenceRequests).pipe(map((results) => results.flat()))
          : of([] as Coverage[]);
      }),
      tap((coverages) => this.coveragesSubject.next(coverages)),
      map((coverages) => ({
        users: this.usersSubject.value,
        absences: this.absencesSubject.value,
        responsibilities: this.responsibilitiesSubject.value,
        coverages,
      }))
    );
  }

  getUnavailabilitiesForUser(userId: string): Observable<Absence[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/unavailabilities`).pipe(
      map((list) => list.map((item) => this.normalizeAbsence(item)))
    );
  }

  getResponsibilitiesForUser(userId: string): Observable<Responsibility[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/responsibilities`).pipe(
      map((list) => list.map((item) => this.normalizeResponsibility(item)))
    );
  }

  getCoveragesForAbsence(userId: string, absenceId: string): Observable<Coverage[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/users/${userId}/unavailabilities/${absenceId}/coverages`)
      .pipe(map((list) => list.map((item) => this.normalizeCoverage(item))));
  }

  createCoverage(userId: string, absenceId: string, coverage: { responsibilityId: string; coveringUserId: string }): Observable<Coverage> {
    return this.http
      .post<any>(`${this.apiUrl}/users/${userId}/unavailabilities/${absenceId}/coverages`, coverage)
      .pipe(map((item) => this.normalizeCoverage(item)));
  }

  deleteCoverage(userId: string, absenceId: string, coverageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}/unavailabilities/${absenceId}/coverages/${coverageId}`);
  }

  private normalizeAbsence(raw: any): Absence {
    return {
      id: raw.id ?? raw._id ?? '',
      user_id: raw.user_id ?? raw.userId ?? raw.user ?? '',
      start_date: raw.start_date ?? raw.startDate ?? '',
      end_date: raw.end_date ?? raw.endDate ?? '',
      reason: raw.reason ?? raw.description ?? '',
      created_at: raw.created_at ?? raw.createdAt ?? '',
    };
  }

  private normalizeResponsibility(raw: any): Responsibility {
    return {
      id: raw.id ?? raw._id ?? '',
      user_id: raw.user_id ?? raw.userId ?? raw.user ?? '',
      description: raw.description ?? raw.reason ?? '',
    };
  }

  private normalizeCoverage(raw: any): Coverage {
    const coveringUserId =
      raw.covering_user_id ?? raw.coveringUserId ?? raw.covering_user ?? raw.coveringUser ?? null;

    return {
      id: raw.id ?? raw._id ?? '',
      covering_user_id: coveringUserId != null ? String(coveringUserId) : null,
      responsibility_id: raw.responsibility_id ?? raw.responsibilityId ?? raw.responsibility ?? '',
      unavailability_id:
        raw.unavailability_id ?? raw.unavailabilityId ?? raw.unavailability ?? raw.unavailabilityId ?? '',
    };
  }
}
