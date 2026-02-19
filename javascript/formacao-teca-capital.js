/**
 * ============================================
 * FORMAÇÃO TECA CAPITAL - SISTEMA COMPLETO
 * ============================================
 * 
 * Funcionalidades:
 * - Sliders automáticos para apresentação e vendas
 * - Contadores animados para estatísticas
 * - Controle de vídeos (pausa automática)
 * - Scroll suave
 * - Atualização automática do ano no copyright
 * - Intersection Observer para animações
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ============================================
    // 1. INICIALIZAÇÃO PRINCIPAL
    // ============================================
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        console.log('🚀 Teca Capital - Sistema de Formação iniciado');
        
        initSliders();
        initCounters();
        setupVideoControls();
        updateCopyrightYear();
        initSmoothScroll();
        initIntersectionObserver();
    }

    // ============================================
    // 2. SISTEMA DE SLIDES
    // ============================================
    
    /**
     * Inicializa todos os sliders da página
     */
    function initSliders() {
        const sliders = [
            { 
                id: 'apresentacao', 
                images: 15,
                basePath: 'Instituição/Teca Capital - Guia Estratégico ',
                fileType: '.png'
            },
            { 
                id: 'vendas', 
                images: 15,
                basePath: 'Vendas/Teca Capital - Estratégia de Venda ',
                fileType: '.png'
            }
        ];
        
        sliders.forEach(slider => {
            const track = document.getElementById(`track-${slider.id}`);
            const indicators = document.getElementById(`indicators-${slider.id}`);
            
            if (!track) {
                console.warn(`⚠️ Slider track não encontrado: track-${slider.id}`);
                return;
            }
            
            // Popular imagens
            populateSliderImages(slider, track);
            
            // Inicializar controle do slider
            if (track.children.length > 0) {
                new SliderController(slider.id, track, indicators);
            }
        });
    }
    
    /**
     * Popula o slider com as imagens
     */
    function populateSliderImages(slider, track) {
        for (let i = 1; i <= slider.images; i++) {
            const slide = document.createElement('div');
            slide.className = 'slider-slide';
            
            const img = document.createElement('img');
            img.src = `${slider.basePath}${i}${slider.fileType}`;
            img.alt = `Slide ${i} - Guia Estratégico`;
            img.loading = 'lazy';
            
            // Fallback para erro de carregamento
            img.onerror = function() {
                console.warn(`⚠️ Imagem não encontrada: ${this.src}`);
                this.style.display = 'none';
                slide.innerHTML = `<div class="slider-error">Imagem ${i} não disponível</div>`;
            };
            
            slide.appendChild(img);
            track.appendChild(slide);
        }
    }
    
    /**
     * Controlador de Slider
     */
    class SliderController {
        constructor(sliderId, track, indicatorsContainer) {
            this.sliderId = sliderId;
            this.track = track;
            this.indicatorsContainer = indicatorsContainer;
            this.slides = track.children;
            this.currentIndex = 0;
            this.totalSlides = this.slides.length;
            this.autoplayInterval = null;
            this.isAutoplayPaused = false;
            
            // Botões de navegação
            this.prevBtn = document.querySelector(`[data-slider="${sliderId}"].slider-prev`);
            this.nextBtn = document.querySelector(`[data-slider="${sliderId}"].slider-next`);
            
            if (this.totalSlides === 0) {
                console.warn(`⚠️ Nenhum slide encontrado para ${sliderId}`);
                return;
            }
            
            this.init();
        }
        
        init() {
            // Criar indicadores
            this.createIndicators();
            
            // Configurar event listeners
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => this.prev());
            }
            
            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => this.next());
            }
            
            // Iniciar autoplay
            this.startAutoplay();
            
            // Pausar autoplay no hover
            const container = this.track.closest('.slider-container');
            if (container) {
                container.addEventListener('mouseenter', () => {
                    this.isAutoplayPaused = true;
                });
                
                container.addEventListener('mouseleave', () => {
                    this.isAutoplayPaused = false;
                });
            }
            
            // Teclado
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    this.prev();
                } else if (e.key === 'ArrowRight') {
                    this.next();
                }
            });
            
            // Atualizar posição inicial
            this.goToSlide(0);
        }
        
        createIndicators() {
            if (!this.indicatorsContainer) return;
            
            this.indicatorsContainer.innerHTML = '';
            
            for (let i = 0; i < this.totalSlides; i++) {
                const dot = document.createElement('span');
                dot.className = 'slider-dot';
                dot.dataset.index = i;
                dot.addEventListener('click', () => this.goToSlide(i));
                this.indicatorsContainer.appendChild(dot);
            }
        }
        
        updateIndicators() {
            if (!this.indicatorsContainer) return;
            
            const dots = this.indicatorsContainer.children;
            for (let i = 0; i < dots.length; i++) {
                if (i === this.currentIndex) {
                    dots[i].classList.add('active');
                } else {
                    dots[i].classList.remove('active');
                }
            }
        }
        
        goToSlide(index) {
            if (index < 0) index = 0;
            if (index >= this.totalSlides) index = this.totalSlides - 1;
            
            this.currentIndex = index;
            const translateX = -this.currentIndex * 100;
            this.track.style.transform = `translateX(${translateX}%)`;
            
            this.updateIndicators();
            
            // Disparar evento personalizado
            const event = new CustomEvent('slideChange', { 
                detail: { sliderId: this.sliderId, index: this.currentIndex } 
            });
            document.dispatchEvent(event);
        }
        
        next() {
            if (this.currentIndex < this.totalSlides - 1) {
                this.goToSlide(this.currentIndex + 1);
            } else {
                // Voltar ao primeiro slide (loop)
                this.goToSlide(0);
            }
        }
        
        prev() {
            if (this.currentIndex > 0) {
                this.goToSlide(this.currentIndex - 1);
            } else {
                // Ir para o último slide (loop)
                this.goToSlide(this.totalSlides - 1);
            }
        }
        
        startAutoplay() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
            }
            
            this.autoplayInterval = setInterval(() => {
                if (!this.isAutoplayPaused) {
                    this.next();
                }
            }, 5000); // Mudar a cada 5 segundos
        }
        
        destroy() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
            }
        }
    }

    // ============================================
    // 3. CONTADORES ANIMADOS
    // ============================================
    
    function initCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');
        
        if (counters.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.5,
            rootMargin: '0px'
        });
        
        counters.forEach(counter => observer.observe(counter));
    }
    
    function animateCounter(counter) {
        const target = parseInt(counter.dataset.target) || 0;
        const current = parseInt(counter.innerText) || 0;
        const duration = 2000; // 2 segundos
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function para animação suave
            const easeOutQuart = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(current + (target - current) * easeOutQuart);
            
            counter.innerText = value;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target;
            }
        }
        
        requestAnimationFrame(updateCounter);
    }

    // ============================================
    // 4. CONTROLE DE VÍDEOS
    // ============================================
    
    function setupVideoControls() {
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
            // Pausar outros vídeos quando um iniciar
            video.addEventListener('play', () => {
                videos.forEach(v => {
                    if (v !== video && !v.paused) {
                        v.pause();
                    }
                });
            });
            
            // Prevenir download do vídeo (opcional)
            video.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
            
            // Carregar metadados apenas
            video.preload = 'metadata';
        });
    }

    // ============================================
    // 5. COPYRIGHT - ANO ATUAL
    // ============================================
    
    function updateCopyrightYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // ============================================
    // 6. SCROLL SUAVE
    // ============================================
    
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href === '#') {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                } else {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    // ============================================
    // 7. INTERSECTION OBSERVER PARA ANIMAÇÕES
    // ============================================
    
    function initIntersectionObserver() {
        const animatedElements = document.querySelectorAll('.card-animated, .benefit-card, .stat-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px'
        });
        
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // ============================================
    // 8. UTILITÁRIOS
    // ============================================
    
    /**
     * Debounce function para performance
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Verificar se elemento está no viewport
     */
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // ============================================
    // 9. LIMPEZA DE RECURSOS
    // ============================================
    
    window.addEventListener('beforeunload', () => {
        // Parar todos os vídeos
        document.querySelectorAll('video').forEach(video => {
            video.pause();
        });
    });

})();

/**
 * ============================================
 * FIM DO SISTEMA FORMAÇÃO TECA CAPITAL
 * ============================================
 */