
import { fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavShellComponent } from './nav-shell.component';

describe('NavShellComponent', () => {
  let component: NavShellComponent;
  let fixture: ComponentFixture<NavShellComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NavShellComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
