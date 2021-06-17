import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MoviesListsQuery } from '../state/movies-lists.query';
import { MoviesListsService } from '../state/movies-lists.service';
import { MoviesListCreateComponent } from '../movies-list-create/movies-list-create.component';

@Component({
  templateUrl: './movies-lists.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviesListsComponent implements OnInit, OnDestroy {
  moviesLists$ = this.moviesListsQuery.selectAll();
  isLoading$ = this.moviesListsQuery.selectLoading();
  selectedListId$ = this.moviesListsQuery.selectActive<string>((entity) => entity.id);

  createListMode = false;
  hideLists = false;

  @ViewChild(MoviesListCreateComponent) createComponent: MoviesListCreateComponent;

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
    this.createComponent.focusInput();
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
