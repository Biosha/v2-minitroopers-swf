import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-input-select',
  templateUrl: './input-select.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './input-select.component.scss',
})
export class InputSelectComponent implements OnChanges {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Sélectionner vos items';
  @Input() limit: number | null = null;
  @Input() disabled = false;
  @Output() selectionChange = new EventEmitter();

  @Input() selectedValues: any[] = [];
  isOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  }

  toggleOption(value: any): void {
    const index = this.selectedValues.indexOf(value);
    if (index > -1) {
      this.selectedValues.splice(index, 1);
    } else if (!this.limit || this.selectedValues.length < this.limit) {
      this.selectedValues.push(value);
    }
    this.selectionChange.emit(this.selectedValues);
  }

  removeItem(event: Event, value: any): void {
    event.stopPropagation();
    const index = this.selectedValues.indexOf(value);
    if (index > -1) {
      this.selectedValues.splice(index, 1);
      this.selectionChange.emit(this.selectedValues);
    }
  }

  isSelected(value: any): boolean {
    return this.selectedValues.includes(value);
  }

  getLabelByValue(value: any): string {
    const option = this.options.find((opt) => opt.value === value);
    return option ? option.label : '';
  }
}
