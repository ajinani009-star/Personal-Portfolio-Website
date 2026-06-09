/**
 * AJIN ANI - Portfolio Website JS
 * Author: Ajin Ani
 * Description: Premium interactive functionalities including scroll reveals,
 * custom cursor glow tracking, active state navigation, mobile menu, and form submission.
 */

document.addEventListener('DOMContentLoaded', () => {

  // Dynamic Copyright Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     MOBILE NAVIGATION Drawer
     ========================================================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-item');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      // Toggle body overflow to prevent scrolling behind open drawer
      if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });

    // Close mobile menu when links are clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    });
  }

  /* ==========================================================================
     HEADER SCROLL TRANSITION
     ========================================================================== */
  const header = document.getElementById('header');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Run on init in case user reloaded scrolled down

  /* ==========================================================================
     INTERACTIVE CURSOR GLOW (DESKTOP ONLY)
     ========================================================================== */
  const cursorGlow = document.getElementById('cursor-glow');
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  // Only run mouse glow on devices with pointer capability (no touch-only)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (cursorGlow && !isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    // Smooth mouse follow using interpolation (lerp)
    const updateCursorGlow = () => {
      const ease = 0.08; // Smoothing factor
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      
      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;
      
      requestAnimationFrame(updateCursorGlow);
    };
    
    updateCursorGlow();
  } else if (cursorGlow) {
    // Hide glow completely on mobile devices
    cursorGlow.style.display = 'none';
  }

  /* ==========================================================================
     SCROLL REVEAL & SKILLS PROGRESS ANIMATIONS
     ========================================================================== */
  const reveals = document.querySelectorAll('.reveal');
  const skillBars = document.querySelectorAll('.skill-bar');

  // Trigger skill bars animations
  const animateSkillBars = () => {
    skillBars.forEach(bar => {
      const width = bar.getAttribute('data-width');
      bar.style.width = width;
    });
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // If the skill section is revealed, animate progress bars
        if (entry.target.id === 'skills' || entry.target.querySelector('.skill-bar')) {
          animateSkillBars();
        }
        
        // Once revealed, we don't need to observe it anymore
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.15, // Trigger when 15% of the element is visible
    rootMargin: '0px 0px -50px 0px' // Offset triggers slightly above viewport bottom
  });

  reveals.forEach(reveal => {
    revealObserver.observe(reveal);
  });

  /* ==========================================================================
     ACTIVE NAVIGATION LINK HIGHLIGHTING
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  
  const activeLinkObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    root: null,
    threshold: 0.3, // Trigger when 30% of the section is visible
    rootMargin: '-20% 0px -60% 0px' // Narrow view bounds for better selection accuracy
  });

  sections.forEach(section => {
    activeLinkObserver.observe(section);
  });

  /* ==========================================================================
     CONTACT FORM HANDLING & VALIDATION
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formSubmit = document.getElementById('form-submit');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Clear status
      formStatus.className = 'form-message';
      formStatus.style.display = 'none';
      
      // Form Fields
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();
      
      // Client-side validations
      if (!name || !email || !subject || !message) {
        showFormStatus('All fields are required. Please fill in the missing details.', 'error');
        return;
      }
      
      if (!validateEmail(email)) {
        showFormStatus('Please enter a valid email address.', 'error');
        return;
      }
      
      // Visual Sending State
      const submitText = formSubmit.querySelector('span');
      const submitIcon = formSubmit.querySelector('i');
      const originalText = submitText.textContent;
      
      submitText.textContent = 'Sending...';
      submitIcon.className = 'fa-solid fa-circle-notch fa-spin';
      formSubmit.disabled = true;
      
      // Send the request using Formspree AJAX if set up, otherwise run local simulation
      const formActionUrl = contactForm.getAttribute('action');
      
      if (formActionUrl && !formActionUrl.includes('YOUR_FORMSPREE_ID_HERE')) {
        // Live Formspree AJAX submission
        fetch(formActionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            subject: subject,
            message: message
          })
        })
        .then(response => {
          if (response.ok) {
            showFormStatus(`Thanks for reaching out, ${name}! Your message has been sent successfully.`, 'success');
            contactForm.reset();
          } else {
            showFormStatus('Oops! There was a problem submitting your form. Please try again.', 'error');
          }
        })
        .catch(error => {
          showFormStatus('Oops! There was a network error. Please check your connection and try again.', 'error');
        })
        .finally(() => {
          resetSubmitButton();
        });
      } else {
        // Fallback simulation for local testing (until Formspree ID is set up)
        setTimeout(() => {
          showFormStatus(`[Demo Mode] Thanks, ${name}! Form validation succeeded. Add your Formspree ID in index.html to receive messages!`, 'success');
          contactForm.reset();
          resetSubmitButton();
        }, 1500);
      }
      
      function resetSubmitButton() {
        submitText.textContent = originalText;
        submitIcon.className = 'fa-solid fa-paper-plane';
        formSubmit.disabled = false;
        
        setTimeout(() => {
          formStatus.style.display = 'none';
        }, 6000);
      }
    });
  }

  // Email validator utility
  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  // Display status message helper
  function showFormStatus(text, type) {
    formStatus.textContent = text;
    formStatus.className = `form-message ${type}`;
    formStatus.style.display = 'block';
  }

});
