import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsersService } from './users.service';
import { User } from '../../shared/models/user';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  const mockUsers: User[] = [
    { id: 1, username: 'user1', role: 'admin' },
    { id: 2, username: 'user2', role: 'user' }
  ];

  const newUser: Partial<User> = {
    username: 'newuser',
    role: 'user',
    password: 'password123'
  };

  const createdUser: User = {
    id: 3,
    username: 'newuser',
    role: 'user'
  };

  const updatedUser: Partial<User> = {
    id: 1,
    username: 'updateduser',
    role: 'admin'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersService]
    });
    
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should return an array of users', () => {
      service.getUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne('api/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should return a single user when found', () => {
      const userId = 1;
      
      service.getUserById(userId).subscribe(user => {
        expect(user).toEqual(mockUsers[0]);
      });

      // The service gets all users and filters client-side
      const req = httpMock.expectOne('api/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should throw an error when user is not found', () => {
      const userId = 999; // Non-existent ID
      
      service.getUserById(userId).subscribe({
        next: () => fail('Expected an error, not a user'),
        error: error => {
          expect(error.message).toBe('User not found');
        }
      });

      const req = httpMock.expectOne('api/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });

  describe('addUser', () => {
    it('should add a new user', () => {
      service.addUser(newUser).subscribe(user => {
        expect(user).toEqual(createdUser);
      });

      const req = httpMock.expectOne('api/users/create');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush(createdUser);
    });
  });

  describe('editUser', () => {
    it('should update an existing user', () => {
      service.editUser(updatedUser).subscribe(user => {
        expect(user).toEqual(updatedUser as User);
      });

      const req = httpMock.expectOne(`api/users/${updatedUser.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedUser);
      req.flush(updatedUser);
    });
  });
});
