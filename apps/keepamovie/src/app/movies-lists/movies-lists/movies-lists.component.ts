import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MoviesListsQuery } from '../state/movies-lists.query';
import { MoviesListsService } from '../state/movies-lists.service';

@Component({
  selector: 'keepadoo-movies-lists',
  templateUrl: './movies-lists.component.html',
  styleUrls: ['./movies-lists.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesListsComponent {
  moviesLists$ = this.moviesListsQuery.selectAll();
  isLoading$ = this.moviesListsQuery.selectLoading();

  createListMode = false;

  constructor(
    private moviesListsQuery: MoviesListsQuery,
    private moviesListsService: MoviesListsService,
    private router: Router
  ) {}

  goToList(listId: string): void {
    this.router.navigate([`/home/movies-lists/${listId}`]);
  }

  createList(): void {
    this.createListMode = true;
  }

  doneCreatingList(): void {
    this.createListMode = false;
  }
}
