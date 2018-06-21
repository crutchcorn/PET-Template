import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {take} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: '{{dashCase name}}-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.activatedRoute.queryParams
      .pipe(take(1))
      .subscribe((params: Params) => {
        if (params['signout']) {
          this.snackBar.open('You\'ve been logged out! See you soon!', 'TTFN!', {
            duration: 3000
          });
        }
      });
  }
}
