import './sass/main.scss';
import photoCardsTpl from './templates/photo-cards.hbs';
import PixabayClient from './js/pixabay-client';

const refs = {
  galleryEl: document.querySelector('.gallery'),
  searchForm: document.querySelector('#search-form'),
  loadMoreButtonEl: document.querySelector('.load-more'),
};

const getGalleryImagesCount = () => {
  return refs.galleryEl.children.length;
};

const showLoadMoreButton = () => {
  refs.loadMoreButtonEl.classList.remove('is-hidden');
};

const hideLoadMoreButton = () => {
  refs.loadMoreButtonEl.classList.add('is-hidden');
};

const scrollDownToTheLastChild = index => {
  const newGalleryCard = refs.galleryEl.children.item(index);
  newGalleryCard.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

const pixabayClient = new PixabayClient();

const onFormSubmit = async event => {
  event.preventDefault();
  pixabayClient.resetPageCounter();
  const formData = new FormData(event.currentTarget);
  const searchQuery = formData.get('searchQuery').trim();

  if (!searchQuery) {
    console.log('Empty request query');
    refs.galleryEl.innerHTML = '';
    return;
  }
  pixabayClient.query = searchQuery;

  try {
    const images = await pixabayClient.fetchImages();
    if (images.length === 0) {
      console.log('Sorry, there are no images matching your search query. Please try again.');
    }

    refs.galleryEl.innerHTML = photoCardsTpl(images);
  } catch (error) {
    console.log('Error', error);
  }

  const currentGalleryImagesCount = getGalleryImagesCount();

  if (currentGalleryImagesCount >= pixabayClient.totalHits) {
    hideLoadMoreButton();
    return;
  }
  showLoadMoreButton();
};

const onLoadMoreButtonClick = async event => {
  try {
    const newImages = await pixabayClient.fetchImages();

    const newItemGalleryIndex = getGalleryImagesCount();
    refs.galleryEl.insertAdjacentHTML('beforeend', photoCardsTpl(newImages));

    scrollDownToTheLastChild(newItemGalleryIndex);

    const currentGalleryImagesCount = getGalleryImagesCount();
    if (currentGalleryImagesCount >= pixabayClient.totalHits) {
      console.log("We're sorry, but you've reached the end of search results.");
      hideLoadMoreButton();
    }
  } catch (error) {
    console.log(error);
  }
};

refs.searchForm.addEventListener('submit', onFormSubmit);
refs.loadMoreButtonEl.addEventListener('click', onLoadMoreButtonClick);
