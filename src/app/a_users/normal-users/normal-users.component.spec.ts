import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalUsersComponent } from './normal-users.component';

describe('NormalUsersComponent', () => {
  let component: NormalUsersComponent;
  let fixture: ComponentFixture<NormalUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NormalUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NormalUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
