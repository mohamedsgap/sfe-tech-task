import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../shared/models/user';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http: HttpClient = inject(HttpClient);

  private readonly apiUrl: string = 'api/users';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    // The backend compares u.id === req.params.id without conversion
    // Since u.id is a number and req.params.id is a string, this comparison will always fail
    // We need to modify our approach to work around this limitation
    
    // Instead of trying to get a specific user by ID, we'll get all users and filter on the client side
    return this.http.get<User[]>(this.apiUrl).pipe(
      map((users: User[]) => {
        const user = users.find((u: User) => u.id === id);
        if (!user) {
          throw new Error('User not found');
        }
        return user;
      })
    );
  }

  addUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/create`, user);
  }

  editUser(user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user?.id}`, user);
  }
}
