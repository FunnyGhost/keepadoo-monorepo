import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MoviesListsQuery } from '../state/movies-lists.query';
import { MoviesListsService } from '../state/movies-lists.service';

@Component({
  templateUrl: './movies-lists.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesListsComponent implements OnInit, OnDestroy {
  moviesLists$ = this.moviesListsQuery.selectAll();
  isLoading$ = this.moviesListsQuery.selectLoading();

  createListMode = false;
  hideLists = false;

  constructor(
    private moviesListsQuery: MoviesListsQuery,
    private moviesListsService: MoviesListsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.moviesListsService.initialize();
  }

  selectList(listId: string): void {
    this.hideLists = true;
    this.router.navigate([`/home/movies-lists/${listId}`]);
  }

  createList(): void {
    this.createListMode = true;
  }

  doneCreatingList(): void {
    this.createListMode = false;
  }

  toggleListVisibility(): void {
    this.hideLists = !this.hideLists;
  }

  ngOnDestroy(): void {
    this.moviesListsService.destroy();
  }
}
