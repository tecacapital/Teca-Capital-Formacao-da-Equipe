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

/**
 * ============================================
 * TECA LIGHTBOX v1.0.0
 * Visualizador de Imagens em Tela Cheia
 * Teca Capital - Formação da Equipe
 * ============================================
 * 
 * Funcionalidades:
 * - Visualização de imagens em tela cheia
 * - Navegação entre imagens do mesmo conjunto
 * - Suporte a teclado (ESC, ←, →)
 * - Suporte a swipe em dispositivos móveis
 * - Agrupamento automático por contexto
 * - Design consistente com identidade Teca Capital
 * 
 * @author Teca Capital
 * @license Proprietary
 */

(function() {
    'use strict';

    class TecaLightbox {
        /**
         * Construtor da classe
         * @param {Object} options - Opções de configuração
         */
        constructor(options = {}) {
            // Configurações padrão
            this.config = {
                animationDuration: 300,
                swipeThreshold: 50,
                enableKeyboard: true,
                enableSwipe: true,
                enableCaption: true,
                enableCounter: true,
                closeOnOverlay: true,
                ...options
            };

            // Propriedades internas
            this.version = '1.0.0';
            this.images = [];
            this.currentSet = [];
            this.currentIndex = 0;
            this.modal = null;
            this.isOpen = false;
            this.touchStartX = 0;
            this.touchEndX = 0;
            this.swipeInProgress = false;

            // Bind dos métodos
            this.openLightbox = this.openLightbox.bind(this);
            this.closeLightbox = this.closeLightbox.bind(this);
            this.nextImage = this.nextImage.bind(this);
            this.prevImage = this.prevImage.bind(this);
            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleTouchStart = this.handleTouchStart.bind(this);
            this.handleTouchEnd = this.handleTouchEnd.bind(this);
            this.handleResize = this.handleResize.bind(this);

            // Inicializar
            this.init();
        }

        /**
         * Inicialização do lightbox
         */
        init() {
            this.createModal();
            this.scanImages();
            this.bindEvents();
            this.setupKeyboardEvents();
            this.setupTouchEvents();
            
            console.log(`✨ TecaLightbox v${this.version} inicializado com sucesso`);
            console.log(`📸 ${this.images.length} imagens preparadas para visualização`);
        }

        /**
         * Cria a estrutura do modal
         */
        createModal() {
            // Verificar se já existe
            if (document.getElementById('tecaLightbox')) {
                this.modal = document.getElementById('tecaLightbox');
                return;
            }

            // Criar elemento do modal
            this.modal = document.createElement('div');
            this.modal.className = 'teca-lightbox';
            this.modal.id = 'tecaLightbox';
            this.modal.setAttribute('aria-hidden', 'true');
            this.modal.setAttribute('role', 'dialog');
            this.modal.setAttribute('aria-modal', 'true');
            this.modal.setAttribute('aria-label', 'Visualizador de imagens em tela cheia');

            // Estrutura HTML do modal
            this.modal.innerHTML = `
                <div class="lightbox-overlay" data-lightbox-close></div>
                <div class="lightbox-container">
                    <button class="lightbox-close" data-lightbox-close aria-label="Fechar visualizador">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                    
                    <button class="lightbox-nav lightbox-prev" aria-label="Imagem anterior" data-lightbox-prev>
                        <i class="fas fa-chevron-left" aria-hidden="true"></i>
                    </button>
                    
                    <div class="lightbox-content">
                        <img src="" alt="" class="lightbox-image" loading="lazy">
                        <div class="lightbox-caption"></div>
                    </div>
                    
                    <button class="lightbox-nav lightbox-next" aria-label="Próxima imagem" data-lightbox-next>
                        <i class="fas fa-chevron-right" aria-hidden="true"></i>
                    </button>
                    
                    <div class="lightbox-counter" aria-live="polite">
                        <span class="current">1</span> / <span class="total">1</span>
                    </div>
                </div>
            `;

            document.body.appendChild(this.modal);
        }

        /**
         * Escaneia todas as imagens da página
         */
        scanImages() {
            // Encontrar todas as imagens
            const allImages = document.querySelectorAll('img:not(.lightbox-ignore)');
            
            this.images = Array.from(allImages)
                .map((img, index) => {
                    // Ignorar imagens muito pequenas (prováveis ícones)
                    if (img.width < 50 && img.height < 50 && !img.closest('.slider-container')) {
                        return null;
                    }

                    // Adicionar classes e atributos
                    img.classList.add('lightbox-trigger');
                    img.setAttribute('data-lightbox-index', index);
                    
                    // Determinar conjunto
                    const set = this.determineImageSet(img);
                    
                    return {
                        element: img,
                        src: img.src,
                        alt: img.alt || 'Imagem Teca Capital',
                        set: set,
                        index: index,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        title: img.title || img.alt || ''
                    };
                })
                .filter(img => img !== null);

            // Agrupar por conjunto
            this.imageSets = this.groupImagesBySet(this.images);
        }

        /**
         * Determina o conjunto de uma imagem
         * @param {HTMLImageElement} img 
         * @returns {string} Identificador do conjunto
         */
        determineImageSet(img) {
            // Verificar se está em um slider
            const slider = img.closest('.slider-container, [class*="slider"], [id*="slider"]');
            if (slider) {
                return slider.id || `slider-${slider.className.replace(/\s+/g, '-')}`;
            }

            // Verificar se está em um card
            const card = img.closest('.content-card, .card, [class*="card"]');
            if (card) {
                return card.id || `card-${card.className.replace(/\s+/g, '-')}`;
            }

            // Verificar se está em uma seção
            const section = img.closest('section');
            if (section) {
                return section.id || `section-${section.className.replace(/\s+/g, '-')}`;
            }

            // Conjunto individual
            return `single-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        /**
         * Agrupa imagens por conjunto
         * @param {Array} images 
         * @returns {Object} Imagens agrupadas
         */
        groupImagesBySet(images) {
            const sets = {};
            
            images.forEach(img => {
                if (!sets[img.set]) {
                    sets[img.set] = [];
                }
                sets[img.set].push(img);
            });

            return sets;
        }

        /**
         * Configura os eventos principais
         */
        bindEvents() {
            // Delegar eventos para todas as imagens
            document.addEventListener('click', (e) => {
                const img = e.target.closest('img.lightbox-trigger');
                if (img) {
                    e.preventDefault();
                    this.openLightbox(img);
                }
            });

            // Botão fechar e overlay
            const closeButtons = this.modal.querySelectorAll('[data-lightbox-close]');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', this.closeLightbox);
            });

            // Navegação
            const prevBtn = this.modal.querySelector('[data-lightbox-prev]');
            const nextBtn = this.modal.querySelector('[data-lightbox-next]');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', this.prevImage);
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', this.nextImage);
            }

            // Evento de resize
            window.addEventListener('resize', this.handleResize);
        }

        /**
         * Configura eventos de teclado
         */
        setupKeyboardEvents() {
            if (!this.config.enableKeyboard) return;
            
            document.addEventListener('keydown', this.handleKeyDown);
        }

        /**
         * Configura eventos de touch para swipe
         */
        setupTouchEvents() {
            if (!this.config.enableSwipe) return;

            this.modal.addEventListener('touchstart', this.handleTouchStart, { passive: true });
            this.modal.addEventListener('touchmove', (e) => {
                if (this.swipeInProgress) {
                    e.preventDefault();
                }
            }, { passive: false });
            this.modal.addEventListener('touchend', this.handleTouchEnd, { passive: true });
        }

        /**
         * Handler para teclado
         * @param {KeyboardEvent} e 
         */
        handleKeyDown(e) {
            if (!this.isOpen) return;

            switch(e.key) {
                case 'Escape':
                    e.preventDefault();
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevImage();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextImage();
                    break;
            }
        }

        /**
         * Handler para touch start
         * @param {TouchEvent} e 
         */
        handleTouchStart(e) {
            this.touchStartX = e.changedTouches[0].screenX;
            this.swipeInProgress = true;
        }

        /**
         * Handler para touch end
         * @param {TouchEvent} e 
         */
        handleTouchEnd(e) {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
            this.swipeInProgress = false;
        }

        /**
         * Handler para resize da janela
         */
        handleResize() {
            if (this.isOpen) {
                // Re-centralizar imagem
                const img = this.modal.querySelector('.lightbox-image');
                if (img) {
                    img.style.maxHeight = `${window.innerHeight * 0.75}px`;
                }
            }
        }

        /**
         * Processa o swipe
         */
        handleSwipe() {
            const diff = this.touchStartX - this.touchEndX;
            
            if (Math.abs(diff) < this.config.swipeThreshold) return;

            if (diff > 0) {
                this.nextImage();
            } else {
                this.prevImage();
            }
        }

        /**
         * Abre o lightbox com uma imagem específica
         * @param {HTMLImageElement} imageElement 
         */
        openLightbox(imageElement) {
            const imageData = this.images.find(img => img.element === imageElement);
            if (!imageData) return;

            // Encontrar todas as imagens do mesmo conjunto
            this.currentSet = this.images.filter(img => img.set === imageData.set);
            this.currentIndex = this.currentSet.findIndex(img => img.element === imageElement);

            // Atualizar conteúdo
            this.updateModalContent();

            // Mostrar modal
            this.modal.classList.add('active');
            document.body.classList.add('lightbox-open');
            this.isOpen = true;

            // Atualizar navegação
            this.updateNavigation();

            // Pre-carregar imagens adjacentes
            this.preloadAdjacentImages();

            console.log(`🔍 Visualizando imagem ${this.currentIndex + 1} de ${this.currentSet.length}`);
        }

        /**
         * Fecha o lightbox
         */
        closeLightbox() {
            this.modal.classList.remove('active');
            document.body.classList.remove('lightbox-open');
            this.isOpen = false;

            // Limpar imagem após animação
            setTimeout(() => {
                if (!this.isOpen) {
                    const modalImg = this.modal.querySelector('.lightbox-image');
                    modalImg.src = '';
                    modalImg.alt = '';
                    
                    const caption = this.modal.querySelector('.lightbox-caption');
                    caption.textContent = '';
                }
            }, this.config.animationDuration);
        }

        /**
         * Navega para a próxima imagem
         */
        nextImage() {
            if (this.currentIndex < this.currentSet.length - 1) {
                this.currentIndex++;
                this.updateModalContent();
                this.preloadAdjacentImages();
            }
        }

        /**
         * Navega para a imagem anterior
         */
        prevImage() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.updateModalContent();
                this.preloadAdjacentImages();
            }
        }

        /**
         * Atualiza o conteúdo do modal
         */
        updateModalContent() {
            const image = this.currentSet[this.currentIndex];
            const modalImg = this.modal.querySelector('.lightbox-image');
            const caption = this.modal.querySelector('.lightbox-caption');
            const counter = this.modal.querySelector('.lightbox-counter');

            // Adicionar classe de loading
            modalImg.classList.add('loading');

            // Atualizar imagem
            modalImg.src = image.src;
            modalImg.alt = image.alt;
            
            // Remover loading quando carregada
            modalImg.onload = () => {
                modalImg.classList.remove('loading');
                modalImg.classList.add('loaded');
            };

            // Atualizar legenda
            if (this.config.enableCaption) {
                caption.textContent = image.alt;
            }

            // Atualizar contador
            if (this.config.enableCounter && this.currentSet.length > 1) {
                counter.style.display = 'block';
                counter.innerHTML = `
                    <span class="current">${this.currentIndex + 1}</span> / 
                    <span class="total">${this.currentSet.length}</span>
                `;
            } else {
                counter.style.display = 'none';
            }

            this.updateNavigation();
        }

        /**
         * Atualiza o estado dos botões de navegação
         */
        updateNavigation() {
            const prevBtn = this.modal.querySelector('[data-lightbox-prev]');
            const nextBtn = this.modal.querySelector('[data-lightbox-next]');

            if (this.currentSet.length <= 1) {
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'none';
                return;
            }

            if (prevBtn) {
                prevBtn.style.display = 'flex';
                prevBtn.disabled = this.currentIndex === 0;
            }

            if (nextBtn) {
                nextBtn.style.display = 'flex';
                nextBtn.disabled = this.currentIndex === this.currentSet.length - 1;
            }
        }

        /**
         * Pré-carrega imagens adjacentes
         */
        preloadAdjacentImages() {
            const indices = [
                this.currentIndex - 1,
                this.currentIndex + 1
            ];

            indices.forEach(index => {
                if (index >= 0 && index < this.currentSet.length) {
                    const img = new Image();
                    img.src = this.currentSet[index].src;
                }
            });
        }

        /**
         * Atualiza o escaneamento de imagens
         * Útil para imagens carregadas dinamicamente
         */
        refresh() {
            this.scanImages();
            console.log(`🔄 Lightbox atualizado: ${this.images.length} imagens encontradas`);
        }

        /**
         * Destrói a instância e limpa recursos
         */
        destroy() {
            // Remover event listeners
            document.removeEventListener('keydown', this.handleKeyDown);
            window.removeEventListener('resize', this.handleResize);

            // Remover modal
            if (this.modal && this.modal.parentNode) {
                this.modal.parentNode.removeChild(this.modal);
            }

            // Remover classes das imagens
            document.querySelectorAll('img.lightbox-trigger').forEach(img => {
                img.classList.remove('lightbox-trigger');
                img.removeAttribute('data-lightbox-index');
            });

            console.log('👋 TecaLightbox finalizado');
        }
    }

    // ============================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ============================================

    /**
     * Inicializa o lightbox quando o DOM estiver pronto
     */
    function initLightbox() {
        // Verificar se já existe uma instância
        if (window.tecaLightbox) {
            console.warn('⚠️ TecaLightbox já está inicializado');
            return;
        }

        // Criar instância
        window.tecaLightbox = new TecaLightbox({
            animationDuration: 300,
            swipeThreshold: 50,
            enableKeyboard: true,
            enableSwipe: true,
            enableCaption: true,
            enableCounter: true,
            closeOnOverlay: true
        });
    }

    // Inicializar baseado no estado do documento
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLightbox);
    } else {
        // DOM já está carregado
        initLightbox();
    }

    // ============================================
    // EXPOR API PÚBLICA
    // ============================================

    window.TecaLightbox = TecaLightbox;

})();