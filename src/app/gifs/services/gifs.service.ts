import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, tap } from 'rxjs';

const GIF_KEY = 'gifs';
const loadFromLocalStorage = () => {
  const history = localStorage.getItem(GIF_KEY) ?? '{}';
  const gifs = JSON.parse(history);
  return gifs;
};

@Injectable({
  providedIn: 'root',
})
export class GifsService {
  private http = inject(HttpClient);
  public trendingGifs = signal<Gif[]>([]);
  trendingGifsLoading = signal(false);

  private trendingPage = signal(0);
  searchHistory = signal<Record<string, Gif[]>>(loadFromLocalStorage());
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

  trendingGifGroup = computed<Gif[][]>(() => {
    const groups = [];
    for (let index = 0; index < this.trendingGifs().length; index += 3) {
      groups.push(this.trendingGifs().slice(index, index + 3));
    }
    return groups;
  });

  saveLocalHistory = effect(() => {
    const history = JSON.stringify(this.searchHistory());
    localStorage.setItem(GIF_KEY, history);
  });

  constructor() {
    this.loadTrendingGifs();
  }
  loadTrendingGifs() {
    const limit = 20;
    const rating = 'g';
    const offset = this.trendingPage() * limit;

    if (this.trendingGifsLoading()) return;
    this.trendingGifsLoading.set(true);
    this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
        params: { api_key: environment.apiKey, limit, rating, offset },
      })
      .subscribe((res) => {
        const gifs = GifMapper.mapGiphyItemToGifArray(res.data);
        this.trendingGifs.update((current) => [...current, ...gifs]);
        this.trendingPage.update((page) => page + 1);
        this.trendingGifsLoading.set(false);
      });
  }

  searchGifs(query: string) {
    const limit = 25;
    const rating = 'g';
    return this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
        params: { api_key: environment.apiKey, limit, rating, q: query.trim() },
      })
      .pipe(
        map(({ data }) => GifMapper.mapGiphyItemToGifArray(data)),
        tap((items) => {
          this.searchHistory.update((history) => ({
            ...history,
            [query.toLowerCase().trim()]: items,
          }));
        })
      );
  }

  getHistoryGifs(query: string) {
    return (this.searchHistory()[query] ??= []);
  }
}
