import { ChangeDetectionStrategy, Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MoviesListsQuery } from '../state/movies-lists.query';
import { MoviesListsService } from '../state/movies-lists.service';

@Component({
  templateUrl: './movies-list-create.component.html',
  styleUrls: ['./movies-list-create.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesListCreateComponent implements OnInit {
  moviesListForm = this.formBuilder.group({
    name: ['', [Validators.minLength(2), Validators.required]]
  });

  error$: Observable<string>;
  loading$: Observable<boolean>;

  @Output() done = new EventEmitter<void>();

  constructor(
    private formBuilder: FormBuilder,
    private query: MoviesListsQuery,
    private moviesListService: MoviesListsService
  ) {}

  ngOnInit() {
    this.error$ = this.query.selectError();
    this.loading$ = this.query.selectLoading();
  }

  onSubmit() {
    this.moviesListService.add({ name: this.moviesListForm.value.name });
    this.onClose();
  }

  onClose(): void {
    this.done.next();
  }
}
