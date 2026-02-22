import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private baseUrl = 'wss://fstream.binance.com/ws';

  connect(stream: string): Observable<any> {
    return new Observable(observer => {

      const ws = new WebSocket(`${this.baseUrl}/${stream}`);

      ws.onmessage = event => {
        observer.next(JSON.parse(event.data));
      };

      ws.onerror = error => observer.error(error);

      ws.onclose = () => observer.complete();

      return () => ws.close();
    });
  }
}
