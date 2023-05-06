import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

const API_KEY = '35888434-3d1691753ee2e5438d46dc4b1';
const URL =
  'https://pixabay.com/api/?key=' +
  API_KEY +
  '&image_type=photo&orientation=horizontal&safesearch=true&per_page=40';

const galleryItemHolder = document.querySelector('.gallery');
const searchForm = document.querySelector('.search-form');
const loadBtn = document.querySelector('.load-more');
let initialPage = 1;

searchForm.addEventListener('submit', handlerSearch);
loadBtn.addEventListener('click', handlerLoadButton);

async function handlerSearch(event) {
  event.preventDefault();
  galleryItemHolder.innerHTML = '';
  initialPage = 1;
  const searchQuery = searchForm.elements['searchQuery'];
  const response = await axios.get(
    URL + '&q=' + encodeURIComponent(searchQuery.value)
  );
  if (!response.data.hits.length) {
    loadBtn.style.visibility = 'hidden';
    return Notiflix.Notify.warning(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  const totalHits = response.data.totalHits;
  const markupResultCards = getGalleryMarkup(response.data.hits);
  galleryItemHolder.insertAdjacentHTML('beforeend', markupResultCards);
  loadBtn.style.visibility = 'visible'; 
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
}


function getGalleryMarkup(items) {
  const resultMarkup = items
    .map(item => {
      return `<div class="photo-card">
      <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
      <div class="info">
        <p class="info-item">
          <b>likes:${item.likes}</b>
        </p>
        <p class="info-item">
          <b>view:${item.views}</b>
        </p>
        <p class="info-item">
          <b>comments:${item.comments}</b>
        </p>
        <p class="info-item">
          <b>downloads:${item.downloads}</b>
        </p>
      </div>
    </div>`;
    })
    .join('');
  return resultMarkup;
}

async function handlerLoadButton() {
  initialPage += 1;
  let pageLoader;
  const searchQuery = searchForm.elements['searchQuery'];
  try {
    pageLoader = await axios.get(
      URL + `&q=${encodeURIComponent(searchQuery.value)}&page=${initialPage}`
    );
  } catch (error) {
    Notiflix.Notify.failure(
      'Were sorry, but you ve reached the end of search results.'
    );
    loadBtn.style.display = 'none';
    throw error;
  }
  const markupResultAfterLoadMore = getGalleryMarkup(pageLoader.data.hits);
  galleryItemHolder.insertAdjacentHTML('beforeend', markupResultAfterLoadMore);

  if (pageLoader.data.hits.length < 1) {
    Notiflix.Notify.failure(
      'Were sorry, but you ve reached the end of search results.'
    );
    loadBtn.style.display = 'none';
  }
}
