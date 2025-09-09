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
        this.targetX = x + (Math.random() - 0.5) * 200;
        this.targetY = Math.random() * 300 + 50;
        this.speed = Math.random() * 3 + 5;
        this.angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.trail = [];
        this.exploded = false;
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        this.particles = [];
        this.life = 1;
        this.gravity = 0.1;
    }

    update() {
        if (!this.exploded) {
            this.trail.unshift({ x: this.x, y: this.y });
            if (this.trail.length > 10) this.trail.pop();

            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity * 0.3;

            if (this.y <= this.targetY || this.vy > 0) {
                this.explode();
            }
        } else {
            this.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += this.gravity;
                particle.life -= 0.02;
                particle.vx *= 0.995;
                particle.vy *= 0.995;
            });

            this.particles = this.particles.filter(p => p.life > 0);
            this.life -= 0.01;
        }
    }

    explode() {
        this.exploded = true;
        const particleCount = Math.random() * 50 + 30;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = Math.random() * 8 + 2;
            
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: `hsl(${Math.random() * 360}, 100%, ${Math.random() * 30 + 50}%)`,
                size: Math.random() * 3 + 1
            });
        }
    }

    draw(ctx) {
        if (!this.exploded) {
            ctx.save();
            this.trail.forEach((point, index) => {
                const alpha = (this.trail.length - index) / this.trail.length;
                ctx.globalAlpha = alpha * 0.8;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });
            
            ctx.globalAlpha = 1;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            ctx.save();
            this.particles.forEach(particle => {
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = particle.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
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
    const count = Math.random() * 5 + 3;
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const y = canvas.height;
            fireworks.push(new Firework(x, y));
        }, i * 200);
    }
    
    if (!animationId) {
        animateFireworks();
    }
}

function animateFireworks() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
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
        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 1000);
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
