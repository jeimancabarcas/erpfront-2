import { Component } from '@angular/core';
import { AuthTemplateComponent } from '../../templates/auth-template/auth-template.component';
import { LoginCardComponent } from '../../organisms/login-card/login-card.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AuthTemplateComponent, LoginCardComponent],
  template: `
    <app-auth-template>
      <app-login-card />
    </app-auth-template>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginPageComponent {}
