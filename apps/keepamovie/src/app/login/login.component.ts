import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../state/auth.service';
import { SessionQuery } from '../state/session.query';

@Component({
  selector: 'keepadoo-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8), Validators.required]]
  });

  error$ = this.query.selectError();
  loading$ = this.query.selectLoading();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private query: SessionQuery
  ) {}

  onSubmit(): void {
    this.authService.signIn(this.loginForm.value.email, this.loginForm.value.password);
  }
}
