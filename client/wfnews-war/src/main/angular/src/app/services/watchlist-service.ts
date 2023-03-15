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

  public removeFromWatchlist (fireYear: string, incidentNumber: string): boolean {
    let result = true
    try {
      const watchlist = this.getWatchlist()
      if (watchlist.includes(fireYear + ':' + incidentNumber)) {
        const index = watchlist.indexOf(fireYear + ':' + incidentNumber)
        watchlist.splice(index, 1)
        this.localStorageService.saveData(WATCHLIST_KEY, JSON.stringify(watchlist))
      }
    } catch (err) {
      console.error(err)
      result = false
    }

    return result
  }

  public async verifyWatchlist () {
    console.warn('Verifying Watchlist')
    for (const watchlistString of this.getWatchlist()) {
      const fireYear = watchlistString.split(':')[0]
      const incidentNumber = watchlistString.split(':')[1]
      try {
        const incident = await this.publishedIncidentService.fetchPublishedIncident(incidentNumber, fireYear).toPromise()
        if (!incident) {
          console.warn('Removing expired incident ' + incidentNumber + ' from Watchlist')
          this.removeFromWatchlist(fireYear, incidentNumber)
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

  public saveToWatchlist (fireYear: string, incidentNumber: string): boolean {
    let result = true
    try {
      const watchlist = this.getWatchlist()
      watchlist.push(`${fireYear}:${incidentNumber}`)
      this.localStorageService.saveData(WATCHLIST_KEY, JSON.stringify(watchlist))
    } catch (err) {
      console.error(err)
      result = false
    }

    return result
  }
}
