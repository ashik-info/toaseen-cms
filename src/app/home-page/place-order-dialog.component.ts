import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-place-order-dialog',
  template: `
    <div class="overlay">
      <div class="dialog">
        <div class="icon">{{ iconClass }}</div>
        <h2>{{ header }}</h2>
        <p [innerText]="message"></p>
        <button (click)="close.emit()">Close</button>
      </div>
    </div>
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .dialog {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        text-align: center;
        max-width: 400px;
        width: 90%;
      }

      .icon {
        font-size: 48px;
        margin-bottom: 10px;
      }

      button {
        margin-top: 20px;
        padding: 8px 16px;
        cursor: pointer;
      }
    `,
  ],
})
export class PlaceOrderDialogComponent {
  @Input() header!: string;
  @Input() message!: string;
  @Input() type: 'success' | 'error' = 'success';
  @Output() close = new EventEmitter<void>();

  get iconClass() {
    return this.type === 'success' ? '✔️' : '⚠️';
  }
}
