import { Component } from '@angular/core';
import MainLayoutComponent from './layout/main-layout/main-layout.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'fronted_gestion_documental';
}
