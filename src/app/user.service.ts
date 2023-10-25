import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from "./user.interface";

/** HTTP headers used for API requests */
const apiHeaders = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

/** Service responsible for handling user-related API operations */
@Injectable({
  providedIn: 'root'
})

export class UserService {

  /** Base URL for the user-related API endpoint. */
  public userApiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  /**
   * Add a new user to the system.
   * 
   * @param user The user data to be added.
   * 
   * @returns An observable of the added user data.
   */
  public addUser(user: User): Observable<User> {
    return this.http.post<User>(this.userApiUrl, user, apiHeaders);
  }

  /**
   * Checks if an email address already exists in the system.
   * 
   * This function sends a GET request to the server using the provided email as a query parameter.
   * The server is expected to return a list of users with the given email (typically 0 or 1 user since emails are usually unique).
   * The function then checks if the returned list of users has a length greater than 0 to determine if the email exists.
   * 
   * @param email The email address to check.
   * 
   * @returns An observable with a boolean value indicating whether the email exists or not.
   */
  public checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<User[]>(`${this.userApiUrl}?email=${email}`)
      .pipe(map(users => users.length > 0));
  }
  
}