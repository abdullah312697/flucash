// Function to get fbclid from URL
const getFbclid = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('fbclid');
  };
  
  // Function to set a cookie
const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Set cookie expiry in days
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  };
  
  // Function to check if a cookie exists
const getCookie = (name) => {
    const cookieArr = document.cookie.split(';');
    for (let cookie of cookieArr) {
      const cookiePair = cookie.trim().split('=');
      if (cookiePair[0] === name) {
        return cookiePair[1];
      }
    }
    return null;
  };
  
  // Function to handle fbc cookie logic
  export const handleFbclidCookie = () => {
    let fbc = getCookie('fbc');
    // If not already stored, capture fbclid from URL
    if (!fbc) {
      const fbclid = getFbclid();
      if (fbclid) {
        // Generate fbc format: "fb.1.{timestamp}.{fbclid}"
        const timestamp = Math.floor(new Date() / 1000);
        fbc = `fb.1.${timestamp}.${fbclid}`;
  
        // Store the fbc in a cookie (for example, 90-day expiry)
        setCookie('fbc', fbc, 90);
      }
    }
  
    return fbc;
  };
  