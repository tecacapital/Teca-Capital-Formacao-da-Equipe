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

/**
 * ============================================
 * SLIDE LIGHTBOX TECA CAPITAL - VERSÃO COMPLETA
 * Visualizador de Imagens dos Slides em Tela Cheia
 * ============================================
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Iniciando Slide Lightbox Teca Capital...');
        
        // Adicionar estilos CSS automaticamente
        adicionarEstilos();
        
        // Criar o modal
        const modal = criarModal();
        
        // Configurar os sliders
        configurarSliders(modal);
    });

    /**
     * Adiciona os estilos CSS diretamente na página
     */
    function adicionarEstilos() {
        if (document.getElementById('lightbox-teca-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'lightbox-teca-styles';
        style.textContent = `
            /* LIGHTBOX TECA CAPITAL - ESTILOS COMPLETOS */
            #lightbox-simples {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 999999;
                display: none;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            }
            
            #lightbox-simples.active {
                display: block;
            }
            
            .lightbox-simples-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                animation: fadeIn 0.3s ease;
            }
            
            .lightbox-simples-container {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000000;
            }
            
            .lightbox-simples-content {
                max-width: 90%;
                max-height: 90%;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            .lightbox-simples-image {
                max-width: 100%;
                max-height: 85vh;
                width: auto;
                height: auto;
                object-fit: contain;
                display: block;
                margin: 0 auto;
                border: 3px solid rgba(214, 174, 100, 0.3);
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
                transition: all 0.3s ease;
            }
            
            .lightbox-simples-close {
                position: absolute;
                top: 25px;
                right: 25px;
                width: 54px;
                height: 54px;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #cc3333;
                color: white;
                font-size: 28px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 1000001;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }
            
            .lightbox-simples-close:hover {
                background: #cc3333;
                border-color: #cc3333;
                transform: rotate(90deg) scale(1.1);
                box-shadow: 0 0 25px rgba(204, 51, 51, 0.5);
            }
            
            .lightbox-simples-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid rgb(214, 174, 100);
                color: white;
                font-size: 40px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 1000001;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }
            
            .lightbox-simples-prev {
                left: 25px;
            }
            
            .lightbox-simples-next {
                right: 25px;
            }
            
            .lightbox-simples-nav:hover:not(.disabled) {
                background: rgb(214, 174, 100);
                border-color: rgb(214, 174, 100);
                color: black;
                transform: translateY(-50%) scale(1.15);
                box-shadow: 0 0 30px rgba(214, 174, 100, 0.6);
            }
            
            .lightbox-simples-nav.disabled {
                opacity: 0.3;
                cursor: not-allowed;
                pointer-events: none;
            }
            
            .lightbox-simples-counter {
                position: absolute;
                bottom: 25px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: #ffffff;
                padding: 10px 24px;
                border-radius: 40px;
                font-size: 16px;
                font-weight: 500;
                border: 2px solid rgba(214, 174, 100, 0.5);
                z-index: 1000001;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }
            
            .lightbox-simples-counter span {
                color: rgb(214, 174, 100);
                font-weight: 700;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes scaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @media (max-width: 768px) {
                .lightbox-simples-close {
                    width: 48px;
                    height: 48px;
                    font-size: 24px;
                    top: 15px;
                    right: 15px;
                }
                
                .lightbox-simples-nav {
                    width: 48px;
                    height: 48px;
                    font-size: 32px;
                }
                
                .lightbox-simples-prev {
                    left: 10px;
                }
                
                .lightbox-simples-next {
                    right: 10px;
                }
                
                .lightbox-simples-counter {
                    bottom: 20px;
                    padding: 8px 20px;
                    font-size: 14px;
                }
            }
            
            @media (max-width: 480px) {
                .lightbox-simples-nav {
                    display: none;
                }
                
                .lightbox-simples-close {
                    width: 44px;
                    height: 44px;
                    font-size: 22px;
                }
                
                .lightbox-simples-counter {
                    font-size: 13px;
                    padding: 6px 16px;
                }
            }
            
            body.lightbox-open {
                overflow: hidden !important;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Cria a estrutura do modal na página
     */
    function criarModal() {
        let modal = document.getElementById('lightbox-simples');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'lightbox-simples';
        modal.innerHTML = `
            <div class="lightbox-simples-overlay"></div>
            <div class="lightbox-simples-container">
                <button class="lightbox-simples-close" id="lightbox-simples-close" aria-label="Fechar">✕</button>
                <button class="lightbox-simples-nav lightbox-simples-prev" id="lightbox-simples-prev" aria-label="Imagem anterior">‹</button>
                <div class="lightbox-simples-content">
                    <img src="" alt="" class="lightbox-simples-image" id="lightbox-simples-image">
                </div>
                <button class="lightbox-simples-nav lightbox-simples-next" id="lightbox-simples-next" aria-label="Próxima imagem">›</button>
                <div class="lightbox-simples-counter" id="lightbox-simples-counter">
                    <span id="contador-atual">1</span> / <span id="contador-total">1</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Configura os sliders
     */
    function configurarSliders(modal) {
        const sliderApresentacao = document.getElementById('slider-apresentacao') || 
                                   document.getElementById('track-apresentacao');
        const sliderVendas = document.getElementById('slider-vendas') || 
                             document.getElementById('track-vendas');
        
        if (sliderApresentacao) configurarSlider(sliderApresentacao, 'apresentacao', modal);
        if (sliderVendas) configurarSlider(sliderVendas, 'vendas', modal);
    }

    /**
     * Configura um slider específico
     */
    function configurarSlider(container, nome, modal) {
        const imagens = container.querySelectorAll('img');
        
        imagens.forEach((img, index) => {
            img.style.cursor = 'pointer';
            img.setAttribute('data-slider', nome);
            img.setAttribute('data-index', index);
            img.setAttribute('data-total', imagens.length);
            
            img.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const sliderNome = this.getAttribute('data-slider');
                const indexAtual = parseInt(this.getAttribute('data-index'));
                const todasImagens = document.querySelectorAll(`[data-slider="${sliderNome}"]`);
                
                abrirLightbox(todasImagens, indexAtual);
            });
        });
    }

    /**
     * Abre o lightbox
     */
    function abrirLightbox(imagens, indexInicial) {
        const modal = document.getElementById('lightbox-simples');
        const imgElement = document.getElementById('lightbox-simples-image');
        const counterAtual = document.getElementById('contador-atual');
        const counterTotal = document.getElementById('contador-total');
        const prevBtn = document.getElementById('lightbox-simples-prev');
        const nextBtn = document.getElementById('lightbox-simples-next');
        const closeBtn = document.getElementById('lightbox-simples-close');
        
        let indexAtual = indexInicial;
        const totalImagens = imagens.length;
        
        // Função para atualizar imagem
        function atualizarImagem() {
            imgElement.src = imagens[indexAtual].src;
            counterAtual.textContent = indexAtual + 1;
            counterTotal.textContent = totalImagens;
            
            prevBtn.classList.toggle('disabled', indexAtual === 0);
            nextBtn.classList.toggle('disabled', indexAtual === totalImagens - 1);
        }
        
        // Funções de navegação
        function proximaImagem() {
            if (indexAtual < totalImagens - 1) {
                indexAtual++;
                atualizarImagem();
            }
        }
        
        function imagemAnterior() {
            if (indexAtual > 0) {
                indexAtual--;
                atualizarImagem();
            }
        }
        
        function fecharLightbox() {
            modal.classList.remove('active');
            modal.style.display = 'none';
            document.body.classList.remove('lightbox-open');
            document.removeEventListener('keydown', handleKeyDown);
        }
        
        // Handler do teclado
        function handleKeyDown(e) {
            if (e.key === 'Escape') fecharLightbox();
            if (e.key === 'ArrowRight') proximaImagem();
            if (e.key === 'ArrowLeft') imagemAnterior();
        }
        
        // Adicionar eventos
        prevBtn.onclick = proximaImagem;
        nextBtn.onclick = imagemAnterior;
        closeBtn.onclick = fecharLightbox;
        modal.querySelector('.lightbox-simples-overlay').onclick = fecharLightbox;
        
        document.addEventListener('keydown', handleKeyDown);
        
        // Mostrar modal
        atualizarImagem();
        modal.style.display = 'block';
        modal.classList.add('active');
        document.body.classList.add('lightbox-open');
    }

})();

/**
 * ============================================
 * QUIZ TECA CAPITAL v1.0.0
 * Sistema de Avaliação Gamificado
 * ============================================
 */

(function() {
    'use strict';

    class QuizTecaCapital {
        constructor() {
            this.participante = {
                nome: '',
                genero: '',
                provincia: ''
            };
            
            this.questoes = [];
            this.questoesRespondidas = [];
            this.indiceAtual = 0;
            this.acertos = 0;
            this.erros = 0;
            this.respostasUsuario = [];
            
            this.init();
        }

        init() {
            this.carregarQuestoes();
            this.bindEvents();
        }

        carregarQuestoes() {
            this.questoes = [
                // ========== PARTE 1: CONHECIMENTO TECA CAPITAL (20 questões) ==========
                {
                    parte: 1,
                    numero: 1,
                    pergunta: "O que define a Teca Capital como uma EdTech?",
                    opcoes: [
                        "A) Uma escola tradicional de ensino presencial",
                        "B) Uma startup de tecnologia educacional que foca na aprendizagem prática através de simuladores",
                        "C) Uma plataforma de vídeos educacionais gravados",
                        "D) Uma consultoria empresarial comum"
                    ],
                    correta: 1, // Índice 1 = opção B
                    explicacao: "A Teca Capital é uma startup de tecnologia educacional que foca na aprendizagem prática, permitindo que os utilizadores experimentem fenómenos económicos e empresariais em ambientes simulados."
                },
                {
                    parte: 1,
                    numero: 2,
                    pergunta: "Qual é a estrutura jurídica atual da empresa?",
                    opcoes: [
                        "A) Uma sociedade anônima com múltiplos acionistas",
                        "B) Uma marca pessoal representada pelo fundador Alberto Teca Tomás",
                        "C) Uma organização não governamental (ONG)",
                        "D) Uma empresa pública estatal"
                    ],
                    correta: 1,
                    explicacao: "Atualmente, a Teca Capital atua como uma marca pessoal representada pelo seu fundador, Alberto Teca Tomás, utilizando o seu NIF ativo e regularizado na AGT."
                },
                {
                    parte: 1,
                    numero: 3,
                    pergunta: "Quais são os quatro pilares de serviços oferecidos pela Teca Capital?",
                    opcoes: [
                        "A) Marketing, Vendas, RH e Finanças",
                        "B) Acesso a Simuladores, Cursos Online, Formações Presenciais e Serviços Personalizados",
                        "C) Consultoria, Auditoria, Contabilidade e Legalização",
                        "D) Eventos, Palestras, Workshops e Seminários"
                    ],
                    correta: 1,
                    explicacao: "Os serviços dividem-se em: Acesso a Simuladores e Biblioteca Digital (1º Pilar), Cursos Online (2º Pilar), Formações Presenciais para instituições (3º Pilar) e Serviços Personalizados (4º Pilar)."
                },
                {
                    parte: 1,
                    numero: 4,
                    pergunta: "Como funciona o acesso ao primeiro pilar de serviços?",
                    opcoes: [
                        "A) Acesso vitalício por 50.000 Kz",
                        "B) Acesso mensal por 2.500 Kz",
                        "C) Acesso de 90 dias por 7.500 Kz com simuladores e biblioteca multimédia",
                        "D) Acesso gratuito com limitação de funcionalidades"
                    ],
                    correta: 2,
                    explicacao: "Por um valor a partir de 7.500 Kz, o utilizador tem acesso de 90 dias à plataforma, incluindo biblioteca multimédia completa e simuladores interativos."
                },
                {
                    parte: 1,
                    numero: 5,
                    pergunta: "O que oferecem os cursos online personalizados de valor superior?",
                    opcoes: [
                        "A) Apenas certificado digital",
                        "B) Videoaulas gravadas sem suporte",
                        "C) Orientação prática detalhada, acesso vitalício a grupo VIP, análises macroeconómicas e eventos exclusivos",
                        "D) Material impresso enviado por correio"
                    ],
                    correta: 2,
                    explicacao: "Estes cursos, de aproximadamente 50.000 Kz, incluem orientação prática detalhada, acesso vitalício a um grupo VIP, análises macroeconómicas e convites para eventos exclusivos."
                },
                {
                    parte: 1,
                    numero: 6,
                    pergunta: "Qual é a proposta de valor para as instituições parceiras no 3º Pilar?",
                    opcoes: [
                        "A) Desconto em compras futuras",
                        "B) Apenas marketing gratuito",
                        "C) Bónus financeiros, prestígio e diferenciação no mercado por serem pioneiras no uso de simuladores",
                        "D) Participação em eventos internacionais"
                    ],
                    correta: 2,
                    explicacao: "As instituições recebem bónus financeiros, prestígio e diferenciação no mercado por serem pioneiras no uso de simuladores práticos em Angola."
                },
                {
                    parte: 1,
                    numero: 7,
                    pergunta: "Quanto podem lucrar os primeiros dez parceiros institucionais?",
                    opcoes: [
                        "A) Entre 5% e 10%",
                        "B) Entre 25% e 50% dependendo do número de inscritos",
                        "C) Valor fixo de 100.000 Kz por mês",
                        "D) Apenas 1% do faturamento total"
                    ],
                    correta: 1,
                    explicacao: "Para os primeiros 10 parceiros estratégicos, a participação nos lucros pode variar entre 25% e 50%, dependendo do número de inscritos."
                },
                {
                    parte: 1,
                    numero: 8,
                    pergunta: "O que engloba o serviço de criação de software personalizado?",
                    opcoes: [
                        "A) Apenas hospedagem de sites",
                        "B) Desenvolvimento de soluções sob medida com valor mínimo entre 4 a 5 milhões de Kz",
                        "C) Manutenção de computadores",
                        "D) Criação de redes sociais"
                    ],
                    correta: 1,
                    explicacao: "Destinado a quem precisa de soluções sob medida, este serviço tem um valor mínimo de referência entre 4 a 5 milhões de Kz, desenvolvendo a solução com base na necessidade específica do cliente."
                },
                {
                    parte: 1,
                    numero: 9,
                    pergunta: "Quais são as metas de faturação e alcance até ao final de 2026?",
                    opcoes: [
                        "A) Formar 1.000 pessoas e faturar 10 milhões",
                        "B) Formar 5.000 pessoas e faturar 30 milhões",
                        "C) Formar 10.000 pessoas e faturar entre 50 e 100 milhões de Kz",
                        "D) Formar 20.000 pessoas e faturar 200 milhões"
                    ],
                    correta: 2,
                    explicacao: "A startup pretende formar pelo menos 10.000 pessoas e atingir uma faturação líquida mínima entre 50 e 100 milhões de Kz."
                },
                {
                    parte: 1,
                    numero: 10,
                    pergunta: "Qual é o vínculo laboral dos colaboradores nesta fase inicial?",
                    opcoes: [
                        "A) Contrato de trabalho efetivo",
                        "B) Estágio profissional obrigatório",
                        "C) Freelancers ou trabalhadores por conta própria, sem vínculo laboral tradicional",
                        "D) Sócios proprietários"
                    ],
                    correta: 2,
                    explicacao: "Com exceção do fundador, todos os membros atuam como freelancers ou trabalhadores por conta própria, sem vínculo laboral tradicional."
                },
                {
                    parte: 1,
                    numero: 11,
                    pergunta: "Como é tratada a retenção de impostos sobre o rendimento dos colaboradores?",
                    opcoes: [
                        "A) Não há retenção de impostos",
                        "B) O colaborador paga tudo sozinho",
                        "C) A Teca Capital retém 6,5% de IRT no ato do pagamento",
                        "D) Retenção de 20% para segurança social"
                    ],
                    correta: 2,
                    explicacao: "A Teca Capital retém 6,5% de IRT no ato do pagamento ao colaborador, entregando esse valor à AGT para garantir a conformidade fiscal."
                },
                {
                    parte: 1,
                    numero: 12,
                    pergunta: "Que impostos incidem sobre os serviços prestados pela Teca Capital?",
                    opcoes: [
                        "A) Apenas IVA de 14%",
                        "B) IRT de 6,5% (retido pelo cliente) e Imposto de Selo de 7% (responsabilidade da Teca)",
                        "C) Imposto industrial de 30%",
                        "D) Nenhum imposto, é isenta"
                    ],
                    correta: 1,
                    explicacao: "Cada serviço está sujeito à retenção de 6,5% de IRT (pela instituição cliente) e ao pagamento de 7% de Imposto de Selo (responsabilidade da Teca Capital)."
                },
                {
                    parte: 1,
                    numero: 13,
                    pergunta: "Como será a distribuição de bónus quando a equipa crescer?",
                    opcoes: [
                        "A) Divisão igual para todos",
                        "B) Por funções: Líder 20%, Formador 17%, Assistente Escritório 10%, Assistente Campo 8%",
                        "C) Apenas o líder recebe",
                        "D) Sorteio entre os membros"
                    ],
                    correta: 1,
                    explicacao: "A distribuição será por funções: Líder recebe cerca de 20%, Formador 17%, Assistente de Escritório 10% e Assistente de Campo 8%."
                },
                {
                    parte: 1,
                    numero: 14,
                    pergunta: "Qual é o objetivo do primeiro ciclo operacional (fevereiro/março 2026)?",
                    opcoes: [
                        "A) Abrir 10 lojas físicas",
                        "B) Contratar 50 funcionários",
                        "C) Fechar parcerias com 4 instituições, 4 formações presenciais, 1.000 inscritos e faturação entre 5 e 7 milhões",
                        "D) Lançar aplicativo mobile"
                    ],
                    correta: 2,
                    explicacao: "A meta é fechar parcerias com 4 instituições, realizar 4 formações presenciais, visando 1.000 inscritos e faturação entre 5 e 7 milhões de Kz."
                },
                {
                    parte: 1,
                    numero: 15,
                    pergunta: "Como é garantida a segurança no acesso dos alunos inscritos?",
                    opcoes: [
                        "A) Senha única para todos",
                        "B) Código de acesso único visível por 60 segundos no momento da inscrição",
                        "C) Acesso por impressão digital",
                        "D) Liberado apenas na instituição"
                    ],
                    correta: 1,
                    explicacao: "Cada participante recebe um código de acesso único que pode ser visualizado por 60 segundos no momento da inscrição, podendo solicitar reenvio à equipa."
                },
                {
                    parte: 1,
                    numero: 16,
                    pergunta: "Qual é a duração do acesso à plataforma após uma formação presencial?",
                    opcoes: [
                        "A) 7 dias",
                        "B) 15 dias",
                        "C) 30 dias",
                        "D) 90 dias"
                    ],
                    correta: 1,
                    explicacao: "Os participantes têm acesso total aos simuladores e à biblioteca por um período de 15 dias, contado a partir do início da inscrição."
                },
                {
                    parte: 1,
                    numero: 17,
                    pergunta: "Que incentivos existem para os alunos com melhor desempenho?",
                    opcoes: [
                        "A) Apenas certificado de honra",
                        "B) Estágios remunerados de 1 a 3 meses e prémios monetários até 20.000 Kz",
                        "C) Bolsa de estudos internacional",
                        "D) Desconto em cursos futuros"
                    ],
                    correta: 1,
                    explicacao: "Os três melhores participantes ganham estágios remunerados e os melhores grupos em desafios recebem prémios monetários até 20.000 Kz."
                },
                {
                    parte: 1,
                    numero: 18,
                    pergunta: "Como é feito o recrutamento de novos membros para a equipa?",
                    opcoes: [
                        "A) Processo seletivo aberto com currículos",
                        "B) Indicação de agências de emprego",
                        "C) Modelo fechado, selecionados a partir de participantes que se destacam em formações",
                        "D) Contratação por concurso público"
                    ],
                    correta: 2,
                    explicacao: "A Teca Capital utiliza um modelo fechado, onde os colaboradores são selecionados exclusivamente a partir de participantes que se destacam em formações, estágios ou palestras."
                },
                {
                    parte: 1,
                    numero: 19,
                    pergunta: "Qual é o diferencial estratégico da Teca Capital face aos concorrentes?",
                    opcoes: [
                        "A) Preços mais baixos",
                        "B) Maior número de cursos",
                        "C) Integração de simuladores sistémicos realistas que permitem aprender com o erro",
                        "D) Parcerias internacionais"
                    ],
                    correta: 2,
                    explicacao: "A Teca Capital integra simuladores sistémicos realistas que permitem aprender com o erro em cenários complexos de gestão e economia."
                },
                {
                    parte: 1,
                    numero: 20,
                    pergunta: "Em que pilares se baseia a estratégia de fecho de parcerias?",
                    opcoes: [
                        "A) Apenas em números",
                        "B) Pilar emocional (dores da instituição) e pilar lógico (números, bónus e diferenciação)",
                        "C) Apenas em marketing",
                        "D) Exclusivamente em networking"
                    ],
                    correta: 1,
                    explicacao: "Baseia-se no pilar emocional (focado nas dores da instituição) e no pilar lógico (focado em números, bónus financeiros e diferenciação competitiva)."
                },
                
                // ========== PARTE 2: COMO VENDER (20 questões) ==========
                {
                    parte: 2,
                    numero: 21,
                    pergunta: "O que é a Teca Capital, segundo o guia de vendas?",
                    opcoes: [
                        "A) Uma consultoria empresarial",
                        "B) Uma EdTech angolana focada em aprendizagem prática com simuladores",
                        "C) Uma escola de idiomas",
                        "D) Uma empresa de marketing digital"
                    ],
                    correta: 1,
                    explicacao: "A Teca Capital é uma EdTech angolana focada em aprendizagem prática, que utiliza tecnologia e simuladores para formar pessoas capazes de tomar decisões reais sem riscos."
                },
                {
                    parte: 2,
                    numero: 22,
                    pergunta: "Como deve ser a abordagem inicial do representante?",
                    opcoes: [
                        "A) Tímida e hesitante",
                        "B) Apresentação firme e confiante, indicando nome, função e que representa a Teca Capital",
                        "C) Apenas enviar um email",
                        "D) Ligar e desligar várias vezes"
                    ],
                    correta: 1,
                    explicacao: "A abordagem deve começar com uma apresentação firme e confiante, onde o representante indica o seu nome, função e deixa claro que representa a Teca Capital."
                },
                {
                    parte: 2,
                    numero: 23,
                    pergunta: "Qual é o conceito central do modelo de ensino da Teca?",
                    opcoes: [
                        "A) Aprender decorando",
                        "B) Aprender fazendo com simuladores que replicam cenários reais",
                        "C) Apenas teoria avançada",
                        "D) Estudo em grupo"
                    ],
                    correta: 1,
                    explicacao: "O modelo baseia-se no conceito de 'aprender fazendo', utilizando simuladores que replicam cenários reais de gestão e economia."
                },
                {
                    parte: 2,
                    numero: 24,
                    pergunta: "Quais são as vantagens de utilizar simuladores para os estudantes?",
                    opcoes: [
                        "A) Economizar papel",
                        "B) Errar, testar estratégias e aprender sem perder dinheiro, sem riscos legais",
                        "C) Apenas entretenimento",
                        "D) Substituir professores"
                    ],
                    correta: 1,
                    explicacao: "Os simuladores permitem que o estudante erre, teste estratégias e aprenda sem perder dinheiro, sem riscos legais e sem consequências institucionais."
                },
                {
                    parte: 2,
                    numero: 25,
                    pergunta: "Qual é o objetivo principal da conversa de vendas com uma instituição?",
                    opcoes: [
                        "A) Vender um único curso",
                        "B) Propor uma parceria estratégica com participação nos ganhos",
                        "C) Conseguir um estágio",
                        "D) Apenas divulgar a marca"
                    ],
                    correta: 1,
                    explicacao: "O objetivo não é apenas vender um serviço, mas sim propor uma parceria estratégica onde a instituição participa nos ganhos financeiros e no prestígio."
                },
                {
                    parte: 2,
                    numero: 26,
                    pergunta: "Como a parceria valoriza a instituição de ensino perante o mercado?",
                    opcoes: [
                        "A) Não valoriza",
                        "B) Oferecendo formação prática real e imersiva, aumentando atratividade",
                        "C) Apenas com desconto",
                        "D) Com material importado"
                    ],
                    correta: 1,
                    explicacao: "A instituição passa a oferecer formação prática real e imersiva, o que aumenta a sua atratividade para novos estudantes e valorização junto dos encarregados."
                },
                {
                    parte: 2,
                    numero: 27,
                    pergunta: "Qual é o benefício financeiro direto para a instituição parceira?",
                    opcoes: [
                        "A) Nenhum",
                        "B) Entre 25% e 50% do faturamento gerado pelas formações",
                        "C) Apenas 5%",
                        "D) Valor fixo mensal"
                    ],
                    correta: 1,
                    explicacao: "A instituição pode receber entre 25% e 50% do faturamento gerado pelas formações, dependendo do envolvimento e do número de inscritos."
                },
                {
                    parte: 2,
                    numero: 28,
                    pergunta: "Como é formalizada a partilha de receitas?",
                    opcoes: [
                        "A) Apenas verbalmente",
                        "B) Clara, contratual e real",
                        "C) Por email informal",
                        "D) Não é formalizada"
                    ],
                    correta: 1,
                    explicacao: "A partilha de receita é clara, contratual e real, não sendo apenas um valor simbólico."
                },
                {
                    parte: 2,
                    numero: 29,
                    pergunta: "O que diferencia a formação da Teca da teoria tradicional?",
                    opcoes: [
                        "A) É mais cara",
                        "B) Os estudantes vivem cenários reais e tomam decisões complexas, sendo avaliados pelo desempenho prático",
                        "C) Tem mais provas escritas",
                        "D) É mais longa"
                    ],
                    correta: 1,
                    explicacao: "Os estudantes vivem cenários reais e tomam decisões complexas, sendo avaliados pelo seu desempenho prático e capacidade de resolver problemas."
                },
                {
                    parte: 2,
                    numero: 30,
                    pergunta: "Que incentivo adicional é oferecido aos melhores estudantes?",
                    opcoes: [
                        "A) Nenhum",
                        "B) Estágios remunerados e oportunidades reais no ecossistema Teca",
                        "C) Apenas certificado",
                        "D) Desconto em cursos"
                    ],
                    correta: 1,
                    explicacao: "Os melhores estudantes têm acesso a estágios remunerados e oportunidades reais dentro do ecossistema da Teca Capital."
                },
                {
                    parte: 2,
                    numero: 31,
                    pergunta: "Qual é o ponto-chave para fechar o negócio?",
                    opcoes: [
                        "A) Falar muito",
                        "B) Convite para demonstração prática do simulador",
                        "C) Oferecer desconto",
                        "D) Ligar todos os dias"
                    ],
                    correta: 1,
                    explicacao: "O ponto-chave é o convite para a demonstração prática, onde o potencial parceiro experimenta o simulador em poucos minutos."
                },
                {
                    parte: 2,
                    numero: 32,
                    pergunta: "Como deve comportar-se o representante durante a demonstração do simulador?",
                    opcoes: [
                        "A) Falar sem parar",
                        "B) Discurso mínimo, permitindo que a experiência do simulador demonstre o valor",
                        "C) Sair da sala",
                        "D) Mostrar slides"
                    ],
                    correta: 1,
                    explicacao: "O discurso deve ser mínimo, permitindo que a própria experiência de uso do simulador demonstre o valor pedagógico e o realismo da plataforma."
                },
                {
                    parte: 2,
                    numero: 33,
                    pergunta: "Quem emite a certificação das formações?",
                    opcoes: [
                        "A) Apenas a Teca Capital",
                        "B) Em parceria com a instituição, fortalecendo a credibilidade",
                        "C) O governo",
                        "D) Uma universidade estrangeira"
                    ],
                    correta: 1,
                    explicacao: "A certificação é emitida em parceria com a instituição, o que fortalece a credibilidade do certificado e o nome da instituição."
                },
                {
                    parte: 2,
                    numero: 34,
                    pergunta: "Como é garantida a segurança jurídica da parceria?",
                    opcoes: [
                        "A) Aperto de mãos",
                        "B) Formalizado por contrato com cláusulas transparentes",
                        "C) Apenas confiança",
                        "D) Gravação da conversa"
                    ],
                    correta: 1,
                    explicacao: "Todo o processo é formalizado por contrato, com cláusulas transparentes sobre percentuais, metas e responsabilidades."
                },
                {
                    parte: 2,
                    numero: 35,
                    pergunta: "Qual é a proposta inicial sugerida para começar a parceria?",
                    opcoes: [
                        "A) Contrato de 5 anos",
                        "B) Formação piloto com valores e percentuais já definidos",
                        "C) Parceria vitalícia",
                        "D) Apenas divulgação"
                    ],
                    correta: 1,
                    explicacao: "A proposta é iniciar com uma formação piloto, com valores de inscrição, metas e percentuais já definidos."
                },
                {
                    parte: 2,
                    numero: 36,
                    pergunta: "Qual a regra de ouro sobre a discussão de preços?",
                    opcoes: [
                        "A) Discutir preço primeiro",
                        "B) Nunca discutir preços antes de apresentar o valor da solução",
                        "C) Sempre dar desconto",
                        "D) Esconder o preço"
                    ],
                    correta: 1,
                    explicacao: "Nunca se deve discutir preços antes de apresentar o valor da solução."
                },
                {
                    parte: 2,
                    numero: 37,
                    pergunta: "Qual é a recomendação sobre a duração do discurso do vendedor?",
                    opcoes: [
                        "A) Falar o máximo possível",
                        "B) Nunca falar mais do que o necessário durante a negociação",
                        "C) Falar apenas de si",
                        "D) Ignorar o cliente"
                    ],
                    correta: 1,
                    explicacao: "O representante deve nunca falar mais do que o necessário durante a negociação."
                },
                {
                    parte: 2,
                    numero: 38,
                    pergunta: "É obrigatório demonstrar o simulador em todas as reuniões?",
                    opcoes: [
                        "A) Não, apenas quando solicitado",
                        "B) Sim, é uma nota estratégica fundamental demonstrar sempre",
                        "C) Apenas na primeira reunião",
                        "D) Raramente"
                    ],
                    correta: 1,
                    explicacao: "Sim, uma das notas estratégicas fundamentais é sempre demonstrar o simulador."
                },
                {
                    parte: 2,
                    numero: 39,
                    pergunta: "Como deve ser conduzido o encerramento da conversa?",
                    opcoes: [
                        "A) Apressadamente",
                        "B) Seguro e respeitoso, reforçando que a parceria coloca a instituição na linha da frente da inovação",
                        "C) Ameaçador",
                        "D) Indiferente"
                    ],
                    correta: 1,
                    explicacao: "Deve ser seguro e respeitoso, reforçando que a parceria coloca a instituição na linha da frente da inovação educacional."
                },
                {
                    parte: 2,
                    numero: 40,
                    pergunta: "O que o representante nunca deve prometer?",
                    opcoes: [
                        "A) Qualidade do serviço",
                        "B) Algo que esteja fora do contrato formal",
                        "C) Resultados rápidos",
                        "D) Certificação"
                    ],
                    correta: 1,
                    explicacao: "O representante está instruído a nunca prometer algo que esteja fora do contrato formal."
                }
            ];
        }

        bindEvents() {
            // Registro
            document.getElementById('formRegistro').addEventListener('submit', (e) => {
                e.preventDefault();
                this.processarRegistro();
            });

            // Botão próximo
            document.getElementById('btnProximo').addEventListener('click', () => {
                this.proximaQuestao();
            });

            // Botões de resultado
            document.getElementById('btnImprimirResultado').addEventListener('click', () => {
                this.imprimirResultado();
            });

            document.getElementById('btnReiniciarQuiz').addEventListener('click', () => {
                this.reiniciarQuiz();
            });
        }

        processarRegistro() {
            const nome = document.getElementById('nomeCompleto').value.trim();
            const genero = document.getElementById('genero').value;
            const provincia = document.getElementById('provincia').value;

            if (!nome || !genero || !provincia) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            this.participante = { nome, genero, provincia };
            
            // Esconder registro e mostrar quiz
            document.getElementById('registroContainer').style.display = 'none';
            document.getElementById('quizContainer').style.display = 'block';
            
            // Resetar estado do quiz
            this.resetarQuiz();
            
            // Mostrar primeira questão
            this.mostrarQuestao(0);
        }

        resetarQuiz() {
            this.indiceAtual = 0;
            this.acertos = 0;
            this.erros = 0;
            this.respostasUsuario = new Array(40).fill(null);
            this.questoesRespondidas = new Array(40).fill(false);
            
            this.atualizarStats();
            document.getElementById('btnProximo').disabled = true;
        }

        mostrarQuestao(indice) {
            const questao = this.questoes[indice];
            const parte = questao.parte === 1 ? 'Conhecimento Teca Capital' : 'Como Vender';
            const numeroDisplay = questao.numero;
            
            document.getElementById('quizParte').textContent = `Parte ${questao.parte}: ${parte}`;
            document.getElementById('questaoNumero').textContent = `Questão ${numeroDisplay}/40`;
            
            // Atualizar barra de progresso
            const progresso = ((indice + 1) / 40) * 100;
            document.getElementById('progressoPreenchimento').style.width = `${progresso}%`;
            
            // Mostrar pergunta
            document.getElementById('questaoTexto').textContent = questao.pergunta;
            
            // Gerar opções
            const opcoesContainer = document.getElementById('opcoesContainer');
            opcoesContainer.innerHTML = '';
            
            questao.opcoes.forEach((opcao, idx) => {
                const opcaoDiv = document.createElement('div');
                opcaoDiv.className = 'quiz-opcao';
                if (this.respostasUsuario[indice] !== null) {
                    opcaoDiv.classList.add('disabled');
                    if (idx === this.respostasUsuario[indice]) {
                        opcaoDiv.classList.add('selecionada');
                        if (idx === questao.correta) {
                            opcaoDiv.classList.add('correta');
                        } else {
                            opcaoDiv.classList.add('incorreta');
                        }
                    } else if (idx === questao.correta && this.respostasUsuario[indice] !== null) {
                        opcaoDiv.classList.add('correta');
                    }
                }
                
                opcaoDiv.innerHTML = `
                    <span class="opcao-letra">${String.fromCharCode(65 + idx)}</span>
                    <span class="opcao-texto">${opcao}</span>
                    ${this.respostasUsuario[indice] !== null ? `
                        <span class="opcao-icon">
                            ${idx === questao.correta ? '<i class="fas fa-check"></i>' : ''}
                            ${idx === this.respostasUsuario[indice] && idx !== questao.correta ? '<i class="fas fa-times"></i>' : ''}
                        </span>
                    ` : ''}
                `;
                
                if (this.respostasUsuario[indice] === null) {
                    opcaoDiv.addEventListener('click', () => this.responderQuestao(indice, idx));
                }
                
                opcoesContainer.appendChild(opcaoDiv);
            });
            
            // Esconder feedback se estiver visível
            document.getElementById('feedbackContainer').style.display = 'none';
        }

        responderQuestao(indice, resposta) {
            if (this.questoesRespondidas[indice]) return;
            
            const questao = this.questoes[indice];
            const isCorreta = resposta === questao.correta;
            
            // Registrar resposta
            this.respostasUsuario[indice] = resposta;
            this.questoesRespondidas[indice] = true;
            
            // Atualizar contadores
            if (isCorreta) {
                this.acertos++;
            } else {
                this.erros++;
            }
            
            this.atualizarStats();
            
            // Mostrar feedback
            this.mostrarFeedback(questao, resposta, isCorreta);
            
            // Recarregar questão para mostrar resultados
            this.mostrarQuestao(indice);
            
            // Habilitar botão próximo
            document.getElementById('btnProximo').disabled = false;
        }

        mostrarFeedback(questao, resposta, isCorreta) {
            const feedbackContainer = document.getElementById('feedbackContainer');
            const feedbackIcon = document.getElementById('feedbackIcon');
            const feedbackMensagem = document.getElementById('feedbackMensagem');
            const feedbackResposta = document.getElementById('feedbackRespostaCorreta');
            
            feedbackContainer.className = `quiz-feedback ${isCorreta ? 'sucesso' : 'erro'}`;
            feedbackIcon.innerHTML = isCorreta ? 
                '<i class="fas fa-check-circle"></i>' : 
                '<i class="fas fa-times-circle"></i>';
            
            feedbackMensagem.textContent = isCorreta ? 
                '✅ Parabéns! Você acertou!' : 
                '❌ Resposta incorreta.';
            
            const letraCorreta = String.fromCharCode(65 + questao.correta);
            const textoCorreta = questao.opcoes[questao.correta];
            
            feedbackResposta.innerHTML = `
                <strong>Resposta correta:</strong> ${letraCorreta} - ${textoCorreta}<br>
                <small style="display:block; margin-top:10px; color:#aaa;">${questao.explicacao}</small>
            `;
            
            feedbackContainer.style.display = 'block';
        }

        proximaQuestao() {
            if (this.indiceAtual < 39) {
                this.indiceAtual++;
                this.mostrarQuestao(this.indiceAtual);
            } else {
                // Final do quiz, mostrar resultado
                this.mostrarResultado();
            }
        }

        atualizarStats() {
            document.getElementById('acertosCount').textContent = this.acertos;
            document.getElementById('errosCount').textContent = this.erros;
        }

        mostrarResultado() {
            document.getElementById('quizContainer').style.display = 'none';
            document.getElementById('resultadoContainer').style.display = 'block';
            
            const percentual = Math.round((this.acertos / 40) * 100);
            let avaliacao = '';
            
            if (percentual >= 90) avaliacao = 'Excelente! Domínio completo do conteúdo.';
            else if (percentual >= 70) avaliacao = 'Bom! Precisa revisar alguns pontos.';
            else if (percentual >= 50) avaliacao = 'Regular. Estude mais o material.';
            else avaliacao = 'Insuficiente. Recomendamos revisar todo o conteúdo.';
            
            // Informações do participante
            document.getElementById('resultadoParticipante').innerHTML = `
                <strong>${this.participante.nome}</strong> • ${this.participante.genero} • ${this.participante.provincia}
            `;
            
            // Estatísticas
            document.getElementById('resultadoAcertos').textContent = this.acertos;
            document.getElementById('resultadoErros').textContent = this.erros;
            document.getElementById('resultadoPercentual').textContent = `${percentual}%`;
            document.getElementById('resultadoAvaliacao').textContent = avaliacao;
            
            // Lista de questões erradas
            this.mostrarQuestoesErradas();
        }

        mostrarQuestoesErradas() {
            const erradasLista = document.getElementById('erradasLista');
            erradasLista.innerHTML = '';
            
            const erros = [];
            for (let i = 0; i < 40; i++) {
                if (this.respostasUsuario[i] !== null && 
                    this.respostasUsuario[i] !== this.questoes[i].correta) {
                    erros.push({
                        numero: this.questoes[i].numero,
                        pergunta: this.questoes[i].pergunta,
                        respostaCorreta: this.questoes[i].opcoes[this.questoes[i].correta],
                        explicacao: this.questoes[i].explicacao
                    });
                }
            }
            
            if (erros.length === 0) {
                erradasLista.innerHTML = '<p style="color: #28a745; text-align: center;">🎉 Parabéns! Você acertou todas as questões!</p>';
            } else {
                erros.forEach(err => {
                    const div = document.createElement('div');
                    div.className = 'errada-item';
                    div.innerHTML = `
                        <div class="errada-pergunta">${err.numero}. ${err.pergunta}</div>
                        <div class="errada-resposta">✓ ${err.respostaCorreta}</div>
                        <div style="color: #aaa; font-size: 0.9rem; margin-top: 5px;">${err.explicacao}</div>
                    `;
                    erradasLista.appendChild(div);
                });
            }
        }

        imprimirResultado() {
            const percentual = Math.round((this.acertos / 40) * 100);
            
            // Criar janela de impressão
            const janelaImpressao = window.open('', '_blank');
            
            janelaImpressao.document.write(`
                <html>
                <head>
                    <title>Resultado da Avaliação - Teca Capital</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; background: #000; color: #fff; }
                        .container { max-width: 800px; margin: 0 auto; }
                        h1 { color: rgb(214, 174, 100); text-align: center; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .info { background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
                        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                        .stat { text-align: center; padding: 20px; background: #1a1a1a; border-radius: 10px; }
                        .stat h2 { color: rgb(214, 174, 100); font-size: 36px; margin: 0; }
                        .erros-lista { margin-top: 30px; }
                        .erro-item { background: #1a1a1a; padding: 15px; margin-bottom: 10px; border-left: 4px solid #dc3545; }
                        .footer { text-align: center; margin-top: 40px; color: #666; }
                        hr { border: 1px solid #333; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>TECA CAPITAL</h1>
                            <h3>Resultado da Avaliação de Formação</h3>
                            <hr>
                        </div>
                        
                        <div class="info">
                            <p><strong>Nome:</strong> ${this.participante.nome}</p>
                            <p><strong>Gênero:</strong> ${this.participante.genero}</p>
                            <p><strong>Província:</strong> ${this.participante.provincia}</p>
                            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-AO')}</p>
                        </div>
                        
                        <div class="stats">
                            <div class="stat">
                                <h2>${this.acertos}</h2>
                                <p>Acertos</p>
                            </div>
                            <div class="stat">
                                <h2>${this.erros}</h2>
                                <p>Erros</p>
                            </div>
                            <div class="stat">
                                <h2>${percentual}%</h2>
                                <p>Aproveitamento</p>
                            </div>
                        </div>
                        
                        <div class="erros-lista">
                            <h3 style="color: rgb(214, 174, 100);">Questões para Revisar</h3>
                            ${this.gerarListaErrosHTML()}
                        </div>
                        
                        <div class="footer">
                            <hr>
                            <p>Documento gerado em ${new Date().toLocaleString('pt-AO')}</p>
                            <p>Teca Capital - Formação da Equipe</p>
                        </div>
                    </div>
                </body>
                </html>
            `);
            
            janelaImpressao.document.close();
            janelaImpressao.print();
        }

        gerarListaErrosHTML() {
            let html = '';
            const erros = [];
            
            for (let i = 0; i < 40; i++) {
                if (this.respostasUsuario[i] !== null && 
                    this.respostasUsuario[i] !== this.questoes[i].correta) {
                    html += `
                        <div class="erro-item">
                            <p><strong>Questão ${this.questoes[i].numero}:</strong> ${this.questoes[i].pergunta}</p>
                            <p><strong>Resposta Correta:</strong> ${this.questoes[i].opcoes[this.questoes[i].correta]}</p>
                            <p style="color: #aaa;">${this.questoes[i].explicacao}</p>
                        </div>
                    `;
                }
            }
            
            return html || '<p>Nenhum erro! Parabéns!</p>';
        }

        reiniciarQuiz() {
            document.getElementById('resultadoContainer').style.display = 'none';
            document.getElementById('registroContainer').style.display = 'block';
            
            // Limpar formulário
            document.getElementById('formRegistro').reset();
        }
    }

    // Inicializar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
        window.quizTeca = new QuizTecaCapital();
    });

})();