import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthResponse } from '../../shared/models/auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser = { id: 1, username: 'testuser', role: 'user' };
  const mockToken = 'mock-jwt-token';
  const mockAuthResponse: AuthResponse = {
    token: mockToken,
    user: mockUser
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send POST request to login endpoint', () => {
      const username = 'testuser';
      const password = 'password';

      service.login(username, password).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, password });
      req.flush(mockAuthResponse);
    });

    it('should store token and user in localStorage after successful login', () => {
      const username = 'testuser';
      const password = 'password';

      service.login(username, password).subscribe();

      const req = httpMock.expectOne('api/auth/login');
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('auth_token')).toBe(mockToken);
      expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockUser));
      expect(service.isAuthenticated()).toBeTrue();
    });
  });

  describe('logout', () => {
    it('should remove token and user from localStorage', () => {
      // Setup: add token and user to localStorage
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      
      service.logout();
      
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should navigate to auth page', () => {
      service.logout();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth']);
    });
  });

  describe('token management', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('auth_token', mockToken);
      expect(service.getToken()).toBe(mockToken);
    });

    it('should return null if no token in localStorage', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return true for hasToken when token exists', () => {
      localStorage.setItem('auth_token', mockToken);
      expect(service.hasToken()).toBeTrue();
    });

    it('should return false for hasToken when no token exists', () => {
      expect(service.hasToken()).toBeFalse();
    });
  });

  describe('user management', () => {
    it('should return user from localStorage', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      expect(service.getUser()).toEqual(mockUser);
    });

    it('should return null if no user in localStorage', () => {
      expect(service.getUser()).toBeNull();
    });
  });

  describe('isAuthenticated signal', () => {
    it('should update to true when token is set', () => {
      // Start with no token
      localStorage.removeItem('auth_token');
      service.isAuthenticated.set(false);
      
      localStorage.setItem('auth_token', mockToken);
      service.isAuthenticated.set(true);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should update to false when token is removed', () => {
      localStorage.setItem('auth_token', mockToken);
      service.isAuthenticated.set(true);
      
      localStorage.removeItem('auth_token');
      service.isAuthenticated.set(false);
      expect(service.isAuthenticated()).toBeFalse();
    });
  });
});
