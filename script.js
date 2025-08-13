window.addEventListener('DOMContentLoaded', () => {
  // 1️⃣ Slide-in videos (unchanged)
  document.querySelectorAll('.video-grid iframe').forEach((iframe, i) => {
    const offset = (i % 2 === 0 ? -50 : 50) + 'px';
    iframe.style.transform      = `translateX(${offset})`;
    iframe.style.opacity        = '0';
    iframe.style.animationDelay = `${i * 0.2}s`;
  });


  // Niche card tilt effect
  document.querySelectorAll('.card').forEach(card => {
    const baseRot = (Math.random() - 0.5) * 6;  // ±3°
    // store the base rotation in a CSS var
    card.style.setProperty('--card-rotate', `${baseRot}deg`);

    card.addEventListener('mouseenter', () => {
      // on hover, zero out rotation
      card.style.setProperty('--card-rotate', '0deg');
    });
    card.addEventListener('mouseleave', () => {
      // restore original rotation
      card.style.setProperty('--card-rotate', `${baseRot}deg`);
    });
  });

    // Feature-section tilt effect (same as niche cards)
  document
    .querySelectorAll('#next-section .grid-container > div')
    .forEach(card => {
      // pick a random “resting” rotation
      const baseRot = (Math.random() - 0.5) * 6; // ±3°
      card.style.setProperty('--card-rotate', '0deg');

      card.addEventListener('mouseenter', () => {
        // on hover, level it out
        card.style.setProperty('--card-rotate', `${baseRot}deg`);
      });
      card.addEventListener('mouseleave', () => {
        // restore the random tilt
        card.style.setProperty('--card-rotate', '0deg');
      });
    });


  // Enable smooth scrolling when the anchor is clicked
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      // Smooth scrolling
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: 'smooth'
      });
    });
  });

  // Carousel logic
  const trackContainer = document.querySelector('.carousel-track-container');
  const carouselTrack   = document.querySelector('.carousel-track');
  const slides          = Array.from(carouselTrack.children);
  const prevBtn         = document.querySelector('.carousel-btn.prev');
  const nextBtn         = document.querySelector('.carousel-btn.next');
  let currentIndex      = 2;

  let isDragging = false;
let startX = 0;
let scrollStart = 0;
let moved = false; // track if mouse/touch moved

trackContainer.addEventListener('touchstart', startDrag, { passive: true });
trackContainer.addEventListener('mousedown', startDrag);

trackContainer.addEventListener('touchmove', dragMove, { passive: true });
trackContainer.addEventListener('mousemove', dragMove);

document.addEventListener('touchend', endDrag); // listen on whole document
document.addEventListener('mouseup', endDrag);
document.addEventListener('mouseleave', endDrag);

function startDrag(e) {
  isDragging = true;
  moved = false;
  startX = e.pageX || e.touches[0].pageX;
  scrollStart = - (slideWidth * currentIndex - centerOffset);
  carouselTrack.style.transition = 'none'; // disable snap while dragging
}

function dragMove(e) {
  if (!isDragging) return;
  moved = true;
  const x = e.pageX || e.touches[0].pageX;
  const moveX = x - startX;
  carouselTrack.style.transform = `translateX(${scrollStart + moveX}px)`;
}


function endDrag(e) {
  if (!isDragging) return;
  isDragging = false;

  if (!moved) return; // treat as a click if no movement

  const movedBy = (e.pageX || (e.changedTouches && e.changedTouches[0].pageX)) - startX;
  if (movedBy < -50 && currentIndex < slides.length - 2) currentIndex++;
  if (movedBy > 50 && currentIndex > 1) currentIndex--;

  updateCarousel();
}

  const slideMargin     = 5;
  const slideWidth      = slides[0].getBoundingClientRect().width + slideMargin;
  const containerWidth  = trackContainer.getBoundingClientRect().width;
  const centerOffset    = (containerWidth - slideWidth) / 2;

  // Initialize a flag to disable animation for the first render
  let isFirstRender = true;

  // Position slides on x‑axis
  slides.forEach((slide, i) => {
    slide.style.left = `${slideWidth * i}px`;
    slide.style.transition = 'opacity 0.3s ease';  // Transition for opacity change
  });

  const updateCarousel = () => {
    slides.forEach((slide, i) => {
      slide.classList.toggle('current-slide', i === currentIndex);
      slide.style.opacity = '0';
      slide.style.scale = '0';

      if (i === currentIndex) {
        slide.style.scale = '1';
        slide.style.opacity = '1';  
        slide.style.zIndex = '2';
      } else if (i === currentIndex - 1 || i === currentIndex + 1) {
        slide.style.scale = '1';
        slide.style.opacity = '1'; // Show left and right neighbors
        slide.style.zIndex = '1';
      }
    });



    const translateX = slideWidth * currentIndex - centerOffset;
    carouselTrack.style.transform = `translateX(-${translateX}px)`;

    if (isFirstRender) {
      isFirstRender = false;
      slides.forEach((slide) => {
        
        slide.style.transition = 'none'; // Disable transition initially
      });
      carouselTrack.style.transition = 'none'; // Disable transform transition initially
    } else {
      slides.forEach((slide) => {
        slide.style.transition = 'opacity 0.3s ease'; // Enable opacity transition after first render
      });
      carouselTrack.style.transition = 'transform 0.3s ease'; // Enable transform transition after first render
    }
  };

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 1) currentIndex--; // Go to previous slide
    updateCarousel();
  });
  
  nextBtn.addEventListener('click', () => {
    if (currentIndex < slides.length - 2) {
      currentIndex++; // Go to next slide
    }
    updateCarousel();
  });

  // Initialize
  updateCarousel();

  //this function prevents any links to be clicked or dragged while the carousel is dragged to prevent bugs
  carouselTrack.querySelectorAll('a').forEach(link => {
  // Stop native drag behavior
  link.setAttribute('draggable', 'false');
  link.addEventListener('dragstart', e => e.preventDefault());

  // Optional: prevent accidental clicks after a drag
  link.addEventListener('click', e => {
    if (moved) {  // "moved" is your drag detection flag
      e.preventDefault(); // don't navigate if it was a drag
    }
  });
});
  // Scroll to hide/show the arrow
  let lastScrollTop = 0; // Keep track of the last scroll position
  const arrow = document.getElementById('arrow'); // Get the arrow element

  window.addEventListener('scroll', function() {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop) {
      // If scrolling down, hide the arrow
      arrow.style.opacity = '0';
    } else {
      // If scrolling up, show the arrow
      arrow.style.opacity = '1';
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Prevent negative scroll
  });

  //counting views
  const counterEl = document.getElementById('counter');
  const target = 273_540_300;
  const start = 220_000_000;
  const duration = 1500; // ms
  const frameRate = 20;
  const totalFrames = Math.round((duration / 1000) * frameRate);
  let frame = 0;
  let hasAnimated = false;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const updateCounter = () => {
    frame++;
    const progress = easeOut(frame / totalFrames);
    const current = Math.round(start + (target - start) * progress);
    counterEl.textContent = current.toLocaleString();

    if (frame < totalFrames) {
      requestAnimationFrame(updateCounter);
    } else {
      counterEl.textContent = target.toLocaleString();
    }
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        updateCounter();
        observer.unobserve(entry.target); // Stop watching once animated
      }
    });
  }, {
    threshold: 0.5 // Start when 50% of the section is visible
  });

  const section = document.getElementById('next-section');
  observer.observe(section);

  
});




