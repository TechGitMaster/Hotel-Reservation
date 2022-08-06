import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpXsrfTokenExtractor, HttpErrorResponse, HttpResponse, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { retry, catchError } from 'rxjs/operators'; 
import { CookieService } from "ngx-cookie-service";


@Injectable()
export class Interceptor implements HttpInterceptor {
  constructor(private tokenExtractor: HttpXsrfTokenExtractor, private cookieService: CookieService) {}

  catchErr(err: HttpErrorResponse): Observable<any>{
    return of(err);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    req = req.clone({
        setHeaders: { 'Content-type': 'application/json' ,
         'Authorization': `Bearer ${this.cookieService.get('token')}` },
        withCredentials: true
    });

    return next.handle(req).pipe( catchError(this.catchErr) );
  }
}