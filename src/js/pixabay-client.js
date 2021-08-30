const API_KEY = '23157120-208317e5fddd4920b074585fd';
const BASE_URL = 'https://pixabay.com/api';
const ITEMS_PER_PAGE = 8;

export default class PixabayClient {
  _currentPage = 1;
  _query;
  _totalHits = null;

  async fetchImages() {
    const url = `${BASE_URL}/?image_type=photo&orientation=horizontal&q=${this._query}&page=${this._currentPage}&per_page=${ITEMS_PER_PAGE}&key=${API_KEY}`;

    try {
      const response = await fetch(url);

      if (response.ok) {
        this._currentPage++;

        const responseResult = await response.json();

        this.totalHits = responseResult.totalHits;

        return responseResult.hits;
      }
    } catch (error) {
      throw new Error('Sorry, unexpected error happened. Please, try again later.');
    }
  }

  get query() {
    return this._query;
  }

  set query(newQuery) {
    this._query = newQuery;
  }

  get totalHits() {
    return this._totalHits;
  }

  set totalHits(totalHitsValue) {
    this._totalHits = totalHitsValue;
  }

  resetPageCounter() {
    this._currentPage = 1;
    this.totalHits = null;
  }
}
