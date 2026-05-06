import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-price-info',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 shadow-sm">
        <span class="text-[10px] font-black text-indigo-400 uppercase leading-none">Precio Configurado:</span>
        <span class="text-xs font-black text-indigo-700 leading-none">
          {{ (sellingPrice || 0) | currency }}
        </span>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100 shadow-sm">
        <span class="text-[10px] font-black text-amber-700 uppercase leading-none">Sugerido (30%):</span>
        <span class="text-xs font-black text-amber-700 leading-none">
          {{ (averagePurchasePrice * 1.3 || 0) | currency }}
        </span>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
        <span class="text-[10px] font-black text-emerald-400 uppercase leading-none">Stock Total:</span>
        <span class="text-xs font-black text-emerald-700 leading-none">{{ currentStock }} unidades</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ProductPriceInfoMolecule {
  @Input() sellingPrice: number = 0;
  @Input() averagePurchasePrice: number = 0;
  @Input() currentStock: number = 0;
}
