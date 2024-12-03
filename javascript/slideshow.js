let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
  }

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("slidedot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

setInterval(() => { plusSlides(1); }, 10000); // Automatically change slide every 5 seconds

document.querySelector('.navCTA').addEventListener('click', () => {
  const subscribeSection = document.querySelector('#subscribe');
  subscribeSection.scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('.navbar').addEventListener('click', () => {
  const subscribeSection = document.querySelector('#headerhome');
  subscribeSection.scrollIntoView({ behavior: 'smooth' });
});
