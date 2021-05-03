import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '../shared/dialog/dialog.module';
import { MovieSearchResultComponent } from './movie-search-result/movie-search-result.component';
import { MovieSearchComponent } from './movie-search/movie-search.component';
import { MovieComponent } from './movie/movie.component';
import { MoviesListCreateComponent } from './movies-list-create/movies-list-create.component';
import { MoviesListDetailsComponent } from './movies-list-details/movies-list-details.component';
import { MoviesListComponent } from './movies-list/movies-list.component';
import { MoviesListsRoutingModule } from './movies-lists-routing.module';
import { MoviesListsComponent } from './movies-lists/movies-lists.component';
import { RatingModule } from '../shared/rating/rating.module';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { DeferModule } from '../shared/defer/defer.module';
import { ButtonModule } from '../shared/button/button.module';
import { SlideUpModule } from '../shared/slide-up/slide-up.module';

@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    MoviesListsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RatingModule,
    DeferModule,
    ButtonModule,
    SlideUpModule,
    SvgIconsModule.forChild([])
  ],
  declarations: [
    MoviesListsComponent,
    MoviesListComponent,
    MoviesListDetailsComponent,
    MovieComponent,
    MovieSearchComponent,
    MovieSearchResultComponent,
    MoviesListCreateComponent
  ]
})
export class MoviesListsModule {}
