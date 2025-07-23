import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  
  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', [], { isAuthenticated: jasmine.createSpy() });
    const routeSpy = jasmine.createSpyObj('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routeSpy }
      ]
    });

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow access when user is authenticated', () => {
    (authServiceSpy.isAuthenticated as jasmine.Spy).and.returnValue(true);
    
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    
    expect(result).toBeTrue();
    expect(routerSpy.parseUrl).not.toHaveBeenCalled();
  });

  it('should redirect to auth page when user is not authenticated', () => {
    (authServiceSpy.isAuthenticated as jasmine.Spy).and.returnValue(false);
    
    const mockUrlTree = {} as UrlTree;
    routerSpy.parseUrl.and.returnValue(mockUrlTree);
    
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    
    expect(result).toBe(mockUrlTree);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/auth');
  });
});