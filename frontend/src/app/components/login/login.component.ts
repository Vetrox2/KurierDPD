import { Component, inject, output, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);

  close = output<void>();

  username = '';
  password = '';
  loading = signal(false);
  errorMessage = signal<string>('');

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.loading.set(true);
    this.errorMessage.set('');

    const success = await this.authService.login(this.username, this.password);

    this.loading.set(false);

    if (success) {
      return;
    } else {
      this.errorMessage.set('Invalid username or password');
    }
  }
  onCancel(): void {
    this.close.emit();
  }
}
