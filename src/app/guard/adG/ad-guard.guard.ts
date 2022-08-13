import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable, of, Subscription } from 'rxjs';
import { MainServiceService } from 'src/app/main_serivce/main-service.service';

@Injectable({
  providedIn: 'root'
})
export class AdGuardGuard implements CanActivate {
  constructor(private cookieService: CookieService, private service: MainServiceService, private route: Router){}

  subs!: Subscription;

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
      var token = this.cookieService.get('token');
      if(token !== '' && token !== ' '){
        return new Observable((ob) => {
          this.subs = this.service.checkingToken().subscribe((result) => {
            if(result.response !== 'no-data'){
              this.subs.unsubscribe();
              if(result.data.adminNot === 'admin') {
                ob.next(true);
              }else{
                this.route.navigate(['/mc/home']);
                ob.next(false);
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
  }
  
}
