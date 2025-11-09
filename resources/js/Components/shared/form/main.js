         const injectSliderStyles = () => {
    const cssStyles = `
    #gallery {
  margin-bottom: 40px;
}
    .gallery .section-subtitle {
    text-align: center;
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto 50px auto;
}

.mosaic-gallery-layout {
    display: grid;
    gap: 20px;
    /* This creates a 4-column grid */
    grid-template-columns: repeat(4, 1fr);
    /* Each row has a set height. This makes the layout stable. */
    grid-auto-rows: 200px; 
}

.mosaic-item {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    cursor: pointer;
}

.mosaic-item img {
    width: 100%;
    height: 100% !important;
    object-fit: cover;
    transition: transform 0.4s ease-out;
}

.mosaic-item:hover img {
    transform: scale(1.1);
}

/* * This is the creative part. We tell each of the 9
 * items how many grid cells to span.
*/

/* Item 1: Big 2x2 square */
.mosaic-item:nth-child(1) {
    grid-column: 1 / span 2;
    grid-row: 1 / span 2;
}
/* Item 2: Small 1x1 square */
.mosaic-item:nth-child(2) {
    grid-column: 3 / span 1;
    grid-row: 1 / span 1;
}
/* Item 3: Small 1x1 square */
.mosaic-item:nth-child(3) {
    grid-column: 4 / span 1;
    grid-row: 1 / span 1;
}
/* Item 4: Small 1x1 square */
.mosaic-item:nth-child(4) {
    grid-column: 3 / span 1;
    grid-row: 2 / span 1;
}
/* Item 5: Small 1x1 square */
.mosaic-item:nth-child(5) {
    grid-column: 4 / span 1;
    grid-row: 2 / span 1;
}
/* Item 6: Small 1x1 square */
.mosaic-item:nth-child(6) {
    grid-column: 1 / span 1;
    grid-row: 3 / span 1;
}
/* Item 7: Small 1x1 square */
.mosaic-item:nth-child(7) {
    grid-column: 2 / span 1;
    grid-row: 3 / span 1;
}
/* Item 8: Horizontal 2x1 rectangle */
.mosaic-item:nth-child(8) {
    grid-column: 3 / span 2;
    grid-row: 3 / span 1;
}
/* Item 9: Wide 4x1 banner */
.mosaic-item:nth-child(9) {
    grid-column: 1 / span 4;
    grid-row: 4 / span 1;
}

    .gallery-lightbox {
    position: fixed !important;
    z-index: 1000 !important;
    top: 0 !important;
    left: 0 !important;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85) !important;
    display: none !important; 
    align-items: center !important;
    justify-content: center !important;
    padding: 20px !important;
}
.lightbox-content {
    display: block;
    max-width: 90vw !important;
    max-height: 90vh !important;
    border-radius: 8px !important;
    animation: zoomIn 0.4s ease-out;
}
.lightbox-close {
    position: absolute;
    top: 20px;
    right: 40px;
    font-size: 3rem;
    color: var(--color-text-light) !important;
    font-weight: 600;
    cursor: pointer;
}
@keyframes zoomIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
}

/*-----------------------------------*/
/* 10. Responsive Mosaic             */
/*-----------------------------------*/
@media (max-width: 768px) {
    .mosaic-gallery-layout {
        /* On mobile, just stack them in a single column */
        grid-template-columns: 1fr;
        grid-auto-rows: 300px; /* Give them a uniform height */
    }
    
    /* Reset all custom spans for mobile */
    .mosaic-item:nth-child(n) {
        grid-column: auto;
        grid-row: auto;
    }
}
    .mobile-header-logo {
  height: 45px !important;
}
     a{
    text-decoration: none  !important;
  }
       .testimonials {
            background-color: var(--color-secondary-dark) !important;
            overflow: hidden; 
              padding: 60px 0  !important;
        }
        
        .testimonials h2 {
            color: var(--color-text-light) !important;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
        }
        
        .review-slider-container {
            width: 100%;
            overflow: hidden;
            -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        
        .review-slider-track {
            display: flex;
            width: fit-content;
            animation: scroll 40s linear infinite;
        }
        
        .review-slider-track:hover {
            animation-play-state: paused;
        }

        @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); } /* Stop at 50% for duplicated content */
        }
        
        .review-card {
            width: 350px;
            margin: 0 15px;
            background-color: var(--color-content-bg) !important;
            border-radius: 8px;
            padding: 30px;
            border-top: 5px solid var(--color-accent-gold) !important;
        }
        
        .review-card p {
            font-style: italic;
            font-size: 1.1rem;
            color: var(--color-text-dark) !important;
            margin-bottom: 20px !important;
        }
        
        .review-card .author {
            font-family: var(--font-heading) !important;
            font-size: 1.3rem !important;
            color: var(--color-primary-dark) !important;
            text-align: right;
        }
    `;
    const styleElement = document.createElement('style');
    styleElement.textContent = cssStyles;
    document.head.appendChild(styleElement);
};
        document.addEventListener("DOMContentLoaded", () => {
            injectSliderStyles()
            // --- Hero Image Slider (only runs if #home exists) ---
            const heroElement = document.getElementById("home");

            if (heroElement) {
                const heroImages = [
                    'https://town-public.s3.amazonaws.com/dinejamandtoast/hero3.jpeg',
                    "https://town-public.s3.amazonaws.com/dinejamandtoast/hero2.jpeg"
                ];
                let currentHeroIndex = 0;

                function changeHeroImage() {
                    currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;
                    const nextImage = heroImages[currentHeroIndex];
                    
                    heroElement.style.setProperty('--hero-bg-image', `url(${nextImage})`);
                    
                    heroElement.classList.remove("kenburns-active");
                    void heroElement.offsetWidth; // Force reflow
                    heroElement.classList.add("kenburns-active");
                }

                heroElement.classList.add("kenburns-active");
                setInterval(changeHeroImage, 8000); 
            }

            // --- Review Slider Logic (only runs if #review-track exists) ---
            const track = document.getElementById("review-track");

            if (track) {
                 const reviewData = [
                    {
                        quote: "First time I came here with my co workers and loved the food. Today I came back with family. It’s welcoming environment...",
                        author: "AFRIN KHAN."
                    },
                    {
                        quote: "Honestly I wish I could give more than 5 stars. We like to try different places and types of food for brunch but we ALWAYS end up coming back here...",
                        author: "Laura Wilson."
                    },
                    {
                        quote: "Jam + Toast is an absolute gem of a breakfast place! From the moment you step in, the inviting aroma of freshly brewed coffee and delicious breakfast delights welcomes you...",
                        author: "Mahmoud Moussa."
                    },
                    {
                        quote: "This has become one of my new favorite restaurants! Their service is super fast (no exaggeration) and their food is delicious!...",
                        author: "Yolanda C."
                    },
                    {
                        quote: "Very good, i had cinnamon roll pancake and bacon egg cheese sandwich",
                        author: "Robbie Rodriguez."
                    },
                    {
                        quote: "Great place to have a good breakfast. My kids being here.",
                        author: "Lovina Jain."
                    },
                    {
                        quote: "Jam + Toast is a great place to go for breakfast or brunch in Frisco. The restaurant has a stylishly decorated interior with exposed brick walls, wood floors...",
                        author: "Jenu."
                    },
                ];

                // Create card HTML
                const cards = reviewData.map(review => {
                    return `
                    <div class="review-card">
                        <p>"${review.quote}"</p>
                      <span class="author">- ${review.author}</span>
               </div>
                    `;
                }).join('');

                // Duplicate cards for infinite scroll
                track.innerHTML = cards + cards;
            }
            
             const mosaicContainer = document.getElementById("mosaic-gallery-container");
            const lightbox = document.getElementById("gallery-lightbox");
            const lightboxImg = document.getElementById("lightbox-img");
            const closeBtn = document.getElementById("lightbox-close");

            if (mosaicContainer && lightbox && lightboxImg && closeBtn) {
                
                // The placeholder image you provided
                // const placeholderImage = 'https://town-public.s3.amazonaws.com/dinejamandtoast/hero3.jpeg';
                
                // This creates an array of 9 items, all using the same image
                const allGalleryImages = [
                    'https://town-public.s3.amazonaws.com/dinejamandtoast/team.webp',
                    "https://town-public.s3.amazonaws.com/dinejamandtoast/esspresso.webp",
                    'https://town-public.s3.amazonaws.com/dinejamandtoast/classicamericanwbacon.webp',
                    "https://town-public.s3.amazonaws.com/dinejamandtoast/burger.webp",
                    'https://town-public.s3.amazonaws.com/dinejamandtoast/cosmo.webp',
                    "https://town-public.s3.amazonaws.com/dinejamandtoast/smile.jpeg",
                    'https://town-public.s3.amazonaws.com/dinejamandtoast/hero.jpeg',
                    "https://town-public.s3.amazonaws.com/dinejamandtoast/people.webp",
                    "https://town-public.s3.amazonaws.com/dinejamandtoast/bg.webp",

                ];

                // --- 2. Populate the Mosaic Grid ---
                allGalleryImages.forEach(imgUrl => {
                    const item = document.createElement('div');
                    item.className = 'mosaic-item'; // Use the new class

                    const img = document.createElement('img');
                    img.src = imgUrl;
                    img.alt = 'Jam + Toast gallery photo';
                    img.loading = 'lazy'; 

                    // Add click listener to open the lightbox
                    item.addEventListener('click', () => {
                        lightboxImg.src = imgUrl;
                        lightbox.style.display = 'flex'; // Show the lightbox
                    });

                    item.appendChild(img);
                    mosaicContainer.appendChild(item);
                });

                // --- 3. Lightbox Close Logic ---
                closeBtn.addEventListener('click', () => {
                    lightbox.style.display = 'none';
                });

                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox) { 
                        lightbox.style.display = 'none';
                    }
                });
            }

            
        });