document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector(".hamborger");
    const atags = document.querySelectorAll(".navbutton"); // Select all elements with the class .navbutton

    // Ensure that the hamburger and nav items are properly selected
    if (!hamburger || atags.length === 0) {
        console.error("Hamburger or nav buttons not found.");
        return;
    }

    // Function to set visibility based on window size
    function setNavButtonVisibility() {
        console.log(window.innerWidth)
        if (window.innerWidth >= 785) {
            // If the width is greater than 785px, make all .navbutton elements visible
            atags.forEach((element) => {
                element.style.visibility = "visible";
                console.log("visibility set to visible")
                element.style.display = "block";
            });
        } else {
            // If the width is less than or equal to 785px, hide the .navbutton elements initially
            atags.forEach((element) => {
                element.style.visibility = "hidden";
                console.log("visibility set to none")
                element.style.display = "none";
            });
        }
    }

    // Set visibility on page load based on initial window size
    setNavButtonVisibility();

    // Toggle the menu when the hamburger is clicked
    hamburger.onclick = function() {
        const navBar = document.querySelector("header");
        navBar.classList.toggle("active");

        // Toggle visibility of .navbutton elements based on whether the menu is active
        if (navBar.classList.contains("active")) {
            // When the menu is active, make all .navbutton elements visible
            atags.forEach((element) => {
                element.style.visibility = "visible";
                element.style.display = "block";
            });
        } else {
            // When the menu is not active, hide all .navbutton elements
            atags.forEach((element) => {
                element.style.visibility = "hidden";
                element.style.display = "block";
            });
        }
    };

    // Re-check the visibility when the window is resized
    window.addEventListener("resize", function() {
        setNavButtonVisibility(); // Adjust visibility based on new window size
    });

    
});
