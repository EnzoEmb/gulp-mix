/**
 * Variable CSS para detectar correctamente 100vh
 * https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
 */
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});