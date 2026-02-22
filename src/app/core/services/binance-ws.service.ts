import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BinanceWsService {

  connect(stream: string): Observable<any> {
    return new Observable(observer => {
      try {
        const ws = new WebSocket(`wss://fstream.binance.com/ws/${stream}`);
        
        ws.onopen = () => {
          console.log(`WebSocket подключен: ${stream}`);
        };

        ws.onmessage = (e) => {
          try {
            if (!e?.data) return;
            const data = JSON.parse(e.data);
            observer.next(data);
          } catch (err) {
            console.error('Ошибка парсинга WebSocket:', err);
          }
        };
        
        ws.onerror = (err) => {
          console.error(`WebSocket ошибка для ${stream}:`, err);
          observer.error(err);
        };
        
        ws.onclose = () => {
          observer.complete();
        };

        return () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        };
      } catch (err) {
        console.error('Ошибка создания WebSocket:', err);
        observer.error(err);
        return () => {};
      }
    });
  }
}