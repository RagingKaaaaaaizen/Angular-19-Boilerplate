
import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpHeaders } from '@angular/common/http'; 
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

import { AlertService } from '@app/_services';
import { Role } from '@app/_models';
// array in local storage for accounts
const accountsKey = 'angular-10-signup-verification-boilerplate-accounts'; let accounts = JSON.parse(localStorage.getItem(accountsKey)) || [];
@Injectable()
export class FakeBackend Interceptor implements HttpInterceptor {
constructor(private alertService: AlertService) { }
intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
const { url, method, headers, body } = request;
const alertService = this.alertService;
return handleRoute();

function handleRoute() {
    switch (true) {
    case url.endsWith('/accounts/authenticate') && method
    return authenticate();
    case url.endsWith('/accounts/refresh-token') && method
    'POST':
    'POST':
    return refreshToken();
    case url.endsWith('/accounts/revoke-token') && method
    'POST':
    return revokeToken();
    case url.endsWith('/accounts/register') && method
    'POST':
    return register();
    case url.endsWith('/accounts/verify-email') && method
    'POST':
    return verifyEmail();
    case url.endsWith('/accounts/forgot-password') && method === 'POST':
    return forgotPassword();
    case url.endsWith('/accounts/validate-reset-token') && method
    'POST':
    return validateResetToken();
    case url.endsWith('/accounts/reset-password') && method
    return resetPassword();
    case url.endsWith('/accounts') && method === 'GET':
    'POST':
    return getAccounts();
    case url.match(/\/accounts\/\d+$/) && method
    return getAccountById();
    'GET':
    }
    }
    case url.endsWith('/accounts') && method === 'POST':
    return createAccount();
    case url.match(/\/accounts\/\d+$/) && method
    return updateAccount();
    'PUT':
    case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
    return deleteAccount();
    default:
    // pass through any requests not handled above
    return next.handle(request);