import { Injectable } from '@angular/core'
import { LocalStorageService } from './local-storage-service'
import { PublishedIncidentService } from './published-incident-service'

const WATCHLIST_KEY = 'WFNEWS_WATCHLIST'

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  constructor(private localStorageService: LocalStorageService, private publishedIncidentService: PublishedIncidentService) {
    this.verifyWatchlist()
  }

  public clearWatchlist () {
    this.localStorageService.removeData(WATCHLIST_KEY)
  }

  public removeFromWatchlist (incidentNumber: string): boolean {
    let result = true
    try {
      const watchlist = this.getWatchlist()
      if (watchlist.includes(incidentNumber)) {
        const index = watchlist.indexOf(incidentNumber)
        watchlist.splice(index, 1)
        this.localStorageService.saveData(WATCHLIST_KEY, JSON.stringify(watchlist))
      }
    } catch (err) {
      console.log(err)
      result = false
    }

    return result
  }

  public async verifyWatchlist () {
    console.warn('Verifying Watchlist')
    for (const incidentNumber of this.getWatchlist()) {
      try {
        const incident = await this.publishedIncidentService.fetchPublishedIncident(incidentNumber).toPromise()
        if (!incident) {
          console.warn('Removing ' + incidentNumber + ' from Watchlist')
          this.removeFromWatchlist(incidentNumber)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  public getWatchlist (): string[] {
    const watchlistString = this.localStorageService.getData(WATCHLIST_KEY)
    if (watchlistString) {
      return JSON.parse(watchlistString) as string[]
    }
    return []
  }

  public saveToWatchlist (incidentNumber: string): boolean {
    let result = true
    try {
      const watchlist = this.getWatchlist()
      watchlist.push(incidentNumber)
      this.localStorageService.saveData(WATCHLIST_KEY, JSON.stringify(watchlist))
    } catch (err) {
      console.log(err)
      result = false
    }

    return result
  }
}
