import './sass/main.scss';
import photoCardsTpl from './templates/photo-cards.hbs';
import PixabayClient from './js/pixabay-client';
import SimpleLightbox from 'simplelightbox';
import Notiflix from 'notiflix';

const refs = {
  galleryEl: document.querySelector('.gallery'),
  searchForm: document.querySelector('#search-form'),
  loadMoreButtonEl: document.querySelector('.load-more'),
};
let lightbox = new SimpleLightbox('.gallery a', {
  animationSpeed: 300,
  fadeSpeed: 200,
  captions: false,
});

lightbox.on(() => {
  lightbox.next();
});

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
    Notiflix.Notify.warning('Please enter something into the Searsh field.');
    refs.galleryEl.innerHTML = '';
    return;
  }
  pixabayClient.query = searchQuery;

  try {
    const images = await pixabayClient.fetchImages();
    if (images.length === 0) {
      Notiflix.Notify.error(
        'Sorry, there are no images matching your search query. Please try again.',
      );
    }

    refs.galleryEl.innerHTML = photoCardsTpl(images);
    lightbox.refresh();
  } catch (error) {
    Notiflix.Notify.error(error);
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
    lightbox.refresh();
    scrollDownToTheLastChild(newItemGalleryIndex);

    const currentGalleryImagesCount = getGalleryImagesCount();
    if (currentGalleryImagesCount >= pixabayClient.totalHits) {
      Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
      hideLoadMoreButton();
    }
  } catch (error) {
    Notiflix.Notify.error(error);
  }
};

const onGalleryImageLinkClicked = event => {
  event.preventDefault();
};

refs.searchForm.addEventListener('submit', onFormSubmit);
refs.loadMoreButtonEl.addEventListener('click', onLoadMoreButtonClick);
refs.galleryEl.addEventListener('click', onGalleryImageLinkClicked);
