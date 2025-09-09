// Generate gallery items
function generateGallery() {
    const gallery = document.getElementById('gallery');
    
    for (let i = 1; i <= 40; i++) {
        const artworkItem = document.createElement('div');
        artworkItem.className = 'artwork-item';
        const imgPath = `imgs/${i}.JPG`;
        artworkItem.onclick = () => openModal(imgPath);
        
        artworkItem.innerHTML = `
            <img src="${imgPath}" alt="Artwork ${i}" onerror="this.style.display='none'">
            <div class="artwork-overlay"></div>
        `;
        
        gallery.appendChild(artworkItem);
    }
}

// Modal functionality
function openModal(imageSrc) {
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    modalImage.src = imageSrc;
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 400);
}

// Enhanced Fireworks System
class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // Better target distribution across full display
        this.targetX = x + (Math.random() - 0.5) * 200;
        this.targetY = Math.random() * (window.innerHeight * 0.6) + 100;
        this.speed = Math.random() * 3 + 5;
        this.angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.trail = [];
        this.exploded = false;
        this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
        this.particles = [];
        this.life = 1;
        this.gravity = 0.12;
        this.fadeIn = 0;
        this.maxTrailLength = 12;
    }

    update() {
        if (!this.exploded) {
            // Fade in effect
            this.fadeIn = Math.min(1, this.fadeIn + 0.05);
            
            this.trail.unshift({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrailLength) this.trail.pop();

            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity * 0.4;

            if (this.y <= this.targetY || this.vy > 0) {
                this.explode();
            }
        } else {
            this.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += this.gravity;
                particle.life -= 0.015;
                particle.vx *= 0.98;
                particle.vy *= 0.98;
                particle.size *= 0.995;
            });

            this.particles = this.particles.filter(p => p.life > 0);
            this.life -= 0.008;
        }
    }

    explode() {
        this.exploded = true;
        const particleCount = 40; // Fixed count for cleaner look
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
            const speed = Math.random() * 8 + 2;
            const hue = (Math.random() * 40 + (this.color.match(/\d+/)[0] - 20)) % 360;
            
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: `hsl(${hue}, 100%, ${Math.random() * 30 + 65}%)`,
                size: Math.random() * 2.5 + 1,
                sparkle: Math.random() > 0.8
            });
        }
    }

    draw(ctx) {
        if (!this.exploded) {
            ctx.save();
            this.trail.forEach((point, index) => {
                const alpha = (this.trail.length - index) / this.trail.length * this.fadeIn;
                ctx.globalAlpha = alpha * 0.9;
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
                ctx.fill();
            });
            
            ctx.globalAlpha = this.fadeIn;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 25;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            ctx.save();
            this.particles.forEach(particle => {
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = particle.color;
                ctx.shadowBlur = particle.sparkle ? 20 : 8;
                ctx.shadowColor = particle.color;
                
                if (particle.sparkle) {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = particle.life * 0.5;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            ctx.restore();
        }
    }

    isDead() {
        return this.exploded && this.particles.length === 0;
    }
}

// Fireworks animation system
let fireworks = [];
let canvas, ctx;
let animationId;

function initCanvas() {
    canvas = document.getElementById('fireworks-canvas');
    ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function launchFireworks() {
    const count = 4; // Fixed number for cleaner look
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            // Distribute across full width with better spacing
            const x = (canvas.width / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 100;
            const y = canvas.height;
            fireworks.push(new Firework(x, y));
        }, i * 300);
    }
    
    if (!animationId) {
        animateFireworks();
    }
}

function animateFireworks() {
    // Cleaner fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    fireworks.forEach((firework, index) => {
        firework.update();
        firework.draw(ctx);
        
        if (firework.isDead()) {
            fireworks.splice(index, 1);
        }
    });
    
    if (fireworks.length > 0) {
        animationId = requestAnimationFrame(animateFireworks);
    } else {
        animationId = null;
        // Quick clean fade out
        let fadeOut = 1;
        const fadeOutInterval = setInterval(() => {
            fadeOut -= 0.05;
            if (fadeOut <= 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                clearInterval(fadeOutInterval);
            } else {
                ctx.fillStyle = `rgba(0, 0, 0, ${fadeOut})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }, 30);
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        launchFireworks();
    } else if (e.key === 'Escape') {
        closeModal();
    }
});

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    generateGallery();
    initCanvas();
});
