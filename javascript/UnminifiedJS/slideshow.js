let slideIndex = 1;   // Starts the script with the first slide selected
showSlides(slideIndex);


function plusSlides(n) {
  showSlides(slideIndex += n);    // Controls the slide progression if the arrows are clicked on either side of the gallery, uses the number 1 or -1 from the onlick in the html to subtract or add to the slide index.
}


function currentSlide(n) {          // Used when the user clicks on one of the dots at the bottom of the gallery, takes the number from that and runs it through the showslides function to make it go to whatever number is passed.
  showSlides(slideIndex = n);     
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");   // Gets all the elements within the slides, for example there's 3 slides, this will assign those to this variable.
  let dots = document.getElementsByClassName("slidedot");  // Does the same as above but for the dots instead of slides
  if (n > slides.length) {slideIndex = 1}   // If the slideIndex is is greater than the number of available slides then this will set the slideIndex to 1, as a fallback.
  if (n < 1) {slideIndex = slides.length} // If the slideInex is less than 1 then this sets the slide index to the last slide which will have the greatest number.
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";     // This hides all the slides by setting display to none
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" dotactive", "");    //Removes the dotactive class from all the gallery navigation dots
  }
  slides[slideIndex-1].style.display = "block";   //Display the current slide, this assumes the first slide starts at 0, as a typical array does.
  dots[slideIndex-1].className += " dotactive";   // Adds the dotactive class to the corresponding dot.
}
setInterval(() => { plusSlides(1); }, 10000); // Automatically changes the slide every 10 seconds, 10000 miliseconds.





