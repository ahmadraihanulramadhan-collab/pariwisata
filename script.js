const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up, .scroll-reveal, .stagger-item').forEach(el => revealObserver.observe(el));

// PARALLAX BANNER (60 FPS SMOOTH)
const navbar = document.querySelector('.navbar-custom');
const progress = document.getElementById('scrollProgress');
const heroBg = document.getElementById('heroBg');
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      navbar.classList.toggle('scrolled', scrollY > 25);
      
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
      
      if (heroBg && scrollY <= 700) {
        heroBg.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
      }
      
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// PERBAIKAN AKURAT SCROLLSPY
const navLinks = document.querySelectorAll('nav a[href^="#"]');
const sections = Array.from(navLinks).map(link => {
  return document.querySelector(link.getAttribute('href'));
}).filter(Boolean);

window.addEventListener('scroll', () => {
  let currentSectionId = '';
  const scrollPosition = window.scrollY + 120;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      currentSectionId = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSectionId}`) {
      link.classList.add('active');
    }
  });
});

// SMOOTH SCROLL NAVBAR LINK
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 65;
      const targetPosition = target.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// PARTICLES & COUNTER
const particles = document.getElementById('heroParticles');
for(let i=0; i<24; i++){
  const p = document.createElement('span');
  p.className = 'particle';
  p.style.left = Math.random()*100 + '%';
  p.style.top = 35 + Math.random()*60 + '%';
  p.style.animationDelay = Math.random()*7 + 's';
  p.style.animationDuration = 5 + Math.random()*5 + 's';
  particles.appendChild(p);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const el = entry.target;
      const target = Number(el.dataset.target);
      const start = performance.now();
      const duration = 1200;
      function run(now){
        const p = Math.min((now-start)/duration, 1);
        const ease = 1-Math.pow(1-p,3);
        const n = Math.floor(target*ease);
        el.textContent = n + (target === 10 ? 'K+' : '+');
        if(p < 1) requestAnimationFrame(run);
      }
      requestAnimationFrame(run);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.8 });
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// MODAL DESTINASI BOOTSTRAP INSTANCE
let destinationModalInstance;
document.addEventListener('DOMContentLoaded', () => {
  destinationModalInstance = new bootstrap.Modal(document.getElementById('destinationModal'));
});

function openModal(title, img, desc){
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalImg').src = img;
  document.getElementById('modalDesc').textContent = 'Temukan keindahan ' + title + ' dalam pengalaman perjalanan yang tenang, nyaman, dan berkesan. ' + desc + '.';
  if (destinationModalInstance) {
    destinationModalInstance.show();
  }
}

// MODAL TIKET EVENT BOOTSTRAP INSTANCE
let ticketModalInstance;
let currentBasePrice = 0;

document.addEventListener('DOMContentLoaded', () => {
  ticketModalInstance = new bootstrap.Modal(document.getElementById('ticketModal'));
});

function openTicketModal(eventTitle, basePrice) {
  currentBasePrice = basePrice;
  document.getElementById('ticketEventTitle').textContent = 'Pesan Tiket - ' + eventTitle;
  document.getElementById('ticketName').value = '';
  document.getElementById('ticketQty').value = 1;
  document.getElementById('ticketType').value = 1;
  updateTotalPrice();
  if (ticketModalInstance) {
    ticketModalInstance.show();
  }
}

function updateTotalPrice() {
  const qty = parseInt(document.getElementById('ticketQty').value) || 1;
  const multiplier = parseFloat(document.getElementById('ticketType').value) || 1;
  const total = currentBasePrice * qty * multiplier;
  document.getElementById('ticketTotalPrice').textContent = '$' + total.toLocaleString();
}

function submitTicket(e) {
  e.preventDefault();
  const name = document.getElementById('ticketName').value;
  alert(`Terima kasih ${name}! Pemesanan tiket Anda telah berhasil dikonfirmasi.`);
  if (ticketModalInstance) {
    ticketModalInstance.hide();
  }
}

// LEAFLET MAP - PERBAIKAN STABILITAS
document.addEventListener('DOMContentLoaded', function(){
  const el = document.getElementById('saudiMap');
  if(!el || typeof L === 'undefined') return;

  const map = L.map('saudiMap', { scrollWheelZoom: false }).setView([24.2, 45.1], 5);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  
  const locations = [
    ['Riyadh', 24.7136, 46.6753, 'Kota modern & budaya'],
    ['Jeddah', 21.4858, 39.1925, 'Laut Merah & kota tua'],
    ['AlUla', 26.6086, 37.9232, 'Situs bersejarah & alam'],
    ['Tabuk', 28.3838, 36.555, 'Pegunungan & gurun']
  ];
  
  locations.forEach(p => L.marker([p[1], p[2]]).addTo(map).bindPopup('<b>'+p[0]+'</b><br>'+p[3]));

  // Memaksa Leaflet menghitung ulang ukuran container agar tidak meluap
  setTimeout(() => {
    map.invalidateSize();
  }, 300);

  // ResizeObserver untuk menjaga posisi & resolusi peta tetap stabil
  if (window.ResizeObserver) {
    new ResizeObserver(() => {
      map.invalidateSize();
    }).observe(el);
  }
});