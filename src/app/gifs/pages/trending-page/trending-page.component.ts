import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { GifsService } from '../../services/gifs.service';
import { ScrollStateService } from 'src/app/shared/service/scroll-state.service';

@Component({
  selector: 'app-trending-page',
  imports: [],
  templateUrl: './trending-page.component.html',
})
export default class TrendingPageComponent implements AfterViewInit {
  gifs = signal('');
  gifsService = inject(GifsService);
  scrollStateService = inject(ScrollStateService);

  scrollDivRef = viewChild<ElementRef<HTMLDivElement>>('groupDiv');
  onScroll(event: Event): void {
    const SCROLL_THRESHOLD = 300;

    const scrollDiv = this.scrollDivRef()?.nativeElement;
    if (!scrollDiv) return;

    const scrollTop = scrollDiv.scrollTop;
    const clientHeight = scrollDiv.clientHeight;
    const scrollheight = scrollDiv.scrollHeight;
    this.scrollStateService.trendingScrollState.set(scrollTop);
    const isAtBottom =
      scrollTop + clientHeight + SCROLL_THRESHOLD >= scrollheight;

    if (isAtBottom) {
      this.gifsService.loadTrendingGifs();
    }
  }

  ngAfterViewInit(): void {
    const scrollDiv = this.scrollDivRef()?.nativeElement;
    if (!scrollDiv) return;
    scrollDiv.scrollTop = this.scrollStateService.trendingScrollState();
  }
}
