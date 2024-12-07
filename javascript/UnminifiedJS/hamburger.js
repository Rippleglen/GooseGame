document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector(".hamborger");  //Called it hamborger just to spice up the code a little, this turns it into the correct spelling of Hamburger.
    const atags = document.querySelectorAll(".navbutton"); 

    
    if (!hamburger || atags.length === 0) { // Used this for debugging due to problems with it being weird when resizing
        console.error("Hamburger or nav buttons not found.");
        return; // All it does is log an error if there's no hamburger div found or if the array that holds the a, li and ul tags returns nothing
    }

    


    let reloadexecuted = localStorage.getItem("reloadexecuted") === "true";
    function setNavButtonVisibility() {   // Made this a function so it can be called whenever the window is resized
        
        if (window.innerWidth >= 785) {     //Checks if the window width is greater than or equal to 785
            
            atags.forEach((element) => {
                element.style.visibility = "visible";       //if it is greater/equal to 785 then set the .navbutton class to visible and display block.
                element.style.display = "block";
            });
            if (reloadexecuted) {
                localStorage.setItem("reloadexecuted", "false");  //Had problems where the hamburger wouldn't work in really weird situations, so force the page to reload when the display width is over 785px
                location.reload();
            }

        } else {
            
            atags.forEach((element) => {
                element.style.visibility = "hidden";    // Just an else here as the only other alternative to the display width being over or equal to 785 is if it's less than 785
                element.style.display = "none";                 // If it is under 785 then set the .navbutton class to hidden and display to none
            });   // Whole point of this is to stop the navbuttons from being clicked when the hamburger isn't active, which was a problem.
            if (!reloadexecuted) {
                localStorage.setItem("reloadexecuted", "true"); //Had problems where the hamburger wouldn't work in really weird situations, so force the page to reload when the display width is under 785px
                location.reload();
            }
        }
    }

    
    setNavButtonVisibility();  // Sets the visibility when the script loads, as the script is tagged with 'defer' this will load after all other stuff on the page is parsed but before the DomContentLoaded event is fired.

    
    hamburger.onclick = function() {
        const navBar = document.querySelector("header");  // This part looks for the onclick event being fired on the header, not sure if this should be the header or the div / a tag but header seems to work fine.
        navBar.classList.toggle("active"); // Toggles the header to have an active class or not have an active class if it's clicked again.

        
        if (navBar.classList.contains("active")) {      // If the header has the active tag then do this
            
            atags.forEach((element) => {
                element.style.visibility = "visible";       // Set the .navbutton class to visible and display block
                element.style.display = "block";
            });
        } else {
            
            atags.forEach((element) => {
                element.style.visibility = "hidden";    // If the header has the .active removed then make the .navbutton class hidden and set is display to none, remember this only runs on the onclick event.
                element.style.display = "none";
            });
        }
    };

    
    window.addEventListener("resize", function() {
        setNavButtonVisibility();                       // This looks for the window being resized and runs the navbuttonvisibility function near the top of this code
    });

    
});
