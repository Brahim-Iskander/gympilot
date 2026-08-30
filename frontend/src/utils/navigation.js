/** Smoothly scrolls to an in-page section by id. */
export function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Navigates home first, then scrolls to the section.
 * Used by navbar/footer links when the user is on another page.
 */
export function navigateThenScroll(navigate, pathname, sectionId) {
  if (pathname === '/') {
    scrollToSection(sectionId);
    return;
  }
  navigate('/');
  setTimeout(() => scrollToSection(sectionId), 350);
}
