import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { MoviesListsQuery } from '../state/movies-lists.query';
import { MoviesListsService } from '../state/movies-lists.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'keepadoo-movies-list-create',
  templateUrl: './movies-list-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesListCreateComponent implements OnInit {
  moviesListForm = this.formBuilder.group({
    name: ['', [Validators.minLength(2), Validators.required]]
  });

  error$: Observable<string>;
  loading$: Observable<boolean>;

  @Output() done = new EventEmitter<void>();
  @ViewChild('inputElement') inputElement: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private query: MoviesListsQuery,
    private moviesListService: MoviesListsService
  ) {}

  ngOnInit() {
    this.error$ = this.query.selectError();
    this.loading$ = this.query.selectLoading();
  }

  focusInput() {
    of({})
      .pipe(delay(500))
      .subscribe(() => this.inputElement.nativeElement.focus());
  }

  onSubmit() {
    this.moviesListService.add({ name: this.moviesListForm.value.name });
    this.onClose();
  }

  onClose(): void {
    this.done.next();
  }
}
