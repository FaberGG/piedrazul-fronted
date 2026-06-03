import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  animate,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';

const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter', style({ opacity: 0, transform: 'translateY(10px)' }), { optional: true }),
    group([
      query(':leave', animate('180ms ease-in', style({ opacity: 0 })), { optional: true }),
      query(':enter', animate('300ms 160ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })), { optional: true }),
    ]),
  ]),
]);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [routeAnimations],
})
export class App {
  getRouteState(outlet: RouterOutlet): unknown {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }
}
