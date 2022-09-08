import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable, of, Subscription } from 'rxjs';
import { MainServiceService } from 'src/app/main_serivce/main-service.service';

@Injectable({
  providedIn: 'root'
})
export class McGuardGuard implements CanActivate {

 constructor(private cookieService: CookieService, private service: MainServiceService, private route: Router){}

 subs!: Subscription;

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {

      var token = this.cookieService.get('token');

      if(route.data['condition'] === 'mc'){
        if(token !== '' && token !== ' '){
          return new Observable((ob) => {
            this.subs = this.service.checkingToken().subscribe((result) => {
              if(result.response !== 'no-data'){
                this.subs.unsubscribe();
                if(result.data.adminNot === 'admin') {
                  this.route.navigate(['/ad/admin']);
                  ob.next(false);
                }else{
                  ob.next(true);
                }
              }else{
                ob.next(true);
              }
            }, (err) => {
              ob.next(true);
            });
          });
        }else{
            return of(true);
        }
      }else if(route.data['condition'] === 'account'){

        if(token !== '' && token !== ' '){
          return new Observable((ob) => {
            this.subs = this.service.checkingToken().subscribe((result) => {
              if(result.response !== 'no-data'){
                this.subs.unsubscribe();
                if(result.data.adminNot === 'not-admin') {
                  ob.next(true);
                }
              }else{
                this.route.navigate(['/mc/home']);
                ob.next(false);
              }
            }, (err) => {
              this.route.navigate(['/mc/home']);
              ob.next(false);
            });
          });
        }else{
            this.route.navigate(['/mc/home']);
            return of(false);
        }

      }else{
        this.route.navigate(['/mc/home']);
        return of(false);
      }
      
  }
  
}
