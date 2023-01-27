import './scss/go-cart.scss';
import {formatMoney} from '@shopify/theme-currency/currency';
import 'whatwg-fetch';
import serialize from 'form-serialize';

class GoCart {

    constructor(options) {

        const defaults = {
            cartModalFail: '.js-go-cart-modal-fail',
            cartModalFailClose: '.js-go-cart-modal-fail-close',
            cartModal: '.js-go-cart-modal',
            cartModalClose: '.js-go-cart-modal-close',
            cartModalContent: '.js-go-cart-modal-content',
            cartDrawer: '.js-go-cart-drawer',
            cartDrawerContent: '.js-go-cart-drawer-content',
            cartDrawerSubTotal: '.js-go-cart-drawer-subtotal',
            cartDrawerFooter: '.js-go-cart-drawer-footer',
            cartDrawerClose: '.js-go-cart-drawer-close',
            cartMiniCart: '.js-go-cart-mini-cart',
            cartMiniCartContent: '.js-go-cart-mini-cart-content',
            cartMiniCartSubTotal: '.js-go-cart-mini-cart-subtotal',
            cartMiniCartFooter: '.js-go-cart-mini-cart-footer',
            cartTrigger: '.js-go-cart-trigger',
            cartOverlay: '.js-go-cart-overlay',
            cartCount: '.js-go-cart-counter',
            addToCart: '.js-go-cart-add-to-cart',
            removeFromCart: '.js-go-cart-remove-from-cart',
            removeFromCartNoDot: 'js-go-cart-remove-from-cart',
            itemQuantity: '.js-go-cart-quantity',
            itemQuantityPlus: '.js-go-cart-quantity-plus',
            itemQuantityMinus: '.js-go-cart-quantity-minus',
            //CUSTOM START
            progressContainer: '.progress-container',
            //CUSTOM END
            cartMode: 'drawer',
            drawerDirection: 'right',
            displayModal: false,
            // eslint-disable-next-line no-template-curly-in-string
            moneyFormat: '${{amount}}',
            labelAddedToCart: 'was added to your cart.',
            labelCartIsEmpty: 'Your Cart is currently empty!',
            labelQuantity: 'Quantity:',
            labelRemove: '<svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.625111 12.8126V2.81256H9.37511V12.8126H0.625111ZM1.875 11.5627H8.125V4.06267H1.875V11.5627ZM10 0.625168V4.06256H0V0.625168H2.55368L3.17863 0H6.82154L7.44648 0.625168H10ZM8.74989 1.87506H6.92863L6.30346 1.25011H3.69637L3.0712 1.87506H1.24994V2.81261H8.74994L8.74989 1.87506Z" fill="black"/></svg>',
        };

        this.defaults = Object.assign({}, defaults, options);
        //CUSTOM
        this.progressContainer = document.querySelector(this.defaults.progressContainer);
        //ENDCUSTOM
        this.cartModalFail = document.querySelector(this.defaults.cartModalFail);
        this.cartModalFailClose = document.querySelector(this.defaults.cartModalFailClose);
        this.cartModal = document.querySelector(this.defaults.cartModal);
        this.cartModalClose = document.querySelectorAll(this.defaults.cartModalClose);
        this.cartModalContent = document.querySelector(this.defaults.cartModalContent);
        this.cartDrawer = document.querySelector(this.defaults.cartDrawer);
        this.cartDrawerContent = document.querySelector(this.defaults.cartDrawerContent);
        this.cartDrawerSubTotal = document.querySelector(this.defaults.cartDrawerSubTotal);
        this.cartDrawerFooter = document.querySelector(this.defaults.cartDrawerFooter);
        this.cartDrawerClose = document.querySelector(this.defaults.cartDrawerClose);
        this.cartMiniCart = document.querySelector(this.defaults.cartMiniCart);
        this.cartMiniCartContent = document.querySelector(this.defaults.cartMiniCartContent);
        this.cartMiniCartSubTotal = document.querySelector(this.defaults.cartMiniCartSubTotal);
        this.cartMiniCartFooter = document.querySelector(this.defaults.cartMiniCartFooter);
        this.cartTrigger = document.querySelectorAll(this.defaults.cartTrigger);
        this.cartOverlay = document.querySelector(this.defaults.cartOverlay);
        this.cartCount = document.querySelector(this.defaults.cartCount);
        this.addToCart = document.querySelectorAll(this.defaults.addToCart);
        this.removeFromCart = this.defaults.removeFromCart;
        this.removeFromCartNoDot = this.defaults.removeFromCartNoDot;
        this.itemQuantity = this.defaults.itemQuantity;
        this.itemQuantityPlus = this.defaults.itemQuantityPlus;
        this.itemQuantityMinus = this.defaults.itemQuantityMinus;
        this.cartMode = this.defaults.cartMode;
        this.drawerDirection = this.defaults.drawerDirection;
        this.displayModal = this.defaults.displayModal;
        this.moneyFormat = this.defaults.moneyFormat;
        this.labelAddedToCart = this.defaults.labelAddedToCart;
        this.labelCartIsEmpty = this.defaults.labelCartIsEmpty;
        this.labelQuantity = this.defaults.labelQuantity;
        this.labelRemove = this.defaults.labelRemove;

        this.init();

    }

    get isDrawerMode() {
        return this.cartMode === 'drawer';
    }

    init() {

        this.fetchCart();

        if (this.isDrawerMode) {
            this.setDrawerDirection();
        }

        document.addEventListener('click', (event) => {
            if (event.target.matches(this.defaults.addToCart)) {
                event.preventDefault();
                let item = event.target;
                let form = item.parentNode;
                while ('form' !== form.tagName.toLowerCase()) {
                    form = form.parentNode;
                }
                const formID = form.getAttribute('id');
                this.addItemToCart(formID);
            }
        }, false);

        this.cartTrigger.forEach((item) => {
            item.addEventListener('click', () => {
                if (this.isDrawerMode) {
                    this.openCartDrawer();
                } else {
                    this.openMiniCart();
                }
                this.openCartOverlay();
            });
        });


        this.cartOverlay.addEventListener('click', () => {
            this.closeFailModal();
            this.closeCartModal();
            if (this.isDrawerMode) {
                this.closeCartDrawer();
            } else {
                this.closeMiniCart();
            }
            this.closeCartOverlay();
        });

        if (this.isDrawerMode) {
            this.cartDrawerClose.addEventListener('click', () => {
                this.closeCartDrawer();
                this.closeCartOverlay();
            });
        }

        if (this.displayModal) {
            this.cartModalClose.forEach((item) => {
                item.addEventListener('click', () => {
                    this.closeFailModal();
                    this.closeCartModal();
                    if (this.isDrawerMode) {
                        this.closeCartDrawer();
                    } else {
                        this.closeMiniCart();
                    }
                    this.closeCartOverlay();
                });
            });
        }

        this.cartModalFailClose.addEventListener('click', () => {
            this.closeFailModal();
            this.closeCartModal();
            if (this.isDrawerMode) {
                this.closeCartDrawer();
            } else {
                this.closeMiniCart();
            }
            this.closeCartOverlay();
        });

    }

    fetchCart(callback) {
        window.fetch('/cart.js', {
            credentials: 'same-origin',
            method: 'GET',
        })
            .then((response) => response.json())
            .then((cart) => this.fetchHandler(cart, callback))
            .catch((error) => {
                this.ajaxRequestFail();
                throw new Error(error);
            });
    }

    checkIfUpdate(response) {
        console.log('UPDATE: next 2 rows');
        console.log(response);
        console.log(this);
    }

    addItemToCart(formID) {
        const form = document.querySelector(`#${formID}`);
        const formData = serialize(form, {hash: true});
        window.fetch('/cart/add.js', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((product) => this.addItemToCartHandler(product))
            .catch((error) => {
                this.ajaxRequestFail();
                throw new Error(error);
            });
    }

    removeItem(line) {
        const quantity = 0;
        window.fetch('/cart/change.js', {
            method: 'POST',
            credentials: 'same-origin',
            body: JSON.stringify({quantity, line}),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then(() => this.fetchCart())
            .catch((error) => {
                this.ajaxRequestFail();
                throw new Error(error);
            });
    }

    changeItemQuantity(line, quantity) {
        window.fetch('/cart/change.js', {
            method: 'POST',
            credentials: 'same-origin',
            body: JSON.stringify({quantity, line}),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((response) => this.checkIfUpdate(response))
            .then(() => this.fetchCart())
            .catch((error) => {
                this.ajaxRequestFail();
                console.log(error);
                throw new Error(error);
            });
    }

    cartItemCount(cart) {
        if(Number(this.cartCount.innerHTML) == cart.item_count) {
            console.log(this);
        }
        this.cartCount.innerHTML = cart.item_count;
    }

    fetchAndOpenCart() {
        this.fetchCart(() => {
            if (this.isDrawerMode) {
                this.openCartDrawer();
            } else {
                this.openMiniCart();
            }
            this.openCartOverlay();
        });
    }

    fetchAndOpenModal(product) {
        this.fetchCart(() => {
            this.renderCartModal(product);
            this.openCartModal();
            this.openCartOverlay();
        });
    }

    fetchHandler(cart, callback) {
        this.cartItemCount(cart);
        if (this.isDrawerMode) {
            if (cart.item_count === 0) {
                this.renderBlankCartDrawer();
                this.cartDrawerFooter.classList.add('is-invisible');
            } else {
                this.renderDrawerCart(cart);
                this.cartDrawerFooter.classList.remove('is-invisible');
                if ((typeof callback) === 'function') {
                    callback(cart);
                }
            }
        } else if (cart.item_count === 0) {
            this.renderBlankMiniCart();
            this.cartMiniCartFooter.classList.add('is-invisible');
        } else {
            this.renderMiniCart(cart);
            this.cartMiniCartFooter.classList.remove('is-invisible');
            if ((typeof callback) === 'function') {
                callback(cart);
            }
        }
    }

    addItemToCartHandler(product) {
        return this.displayModal ? this.fetchAndOpenModal(product) : this.fetchAndOpenCart();
    }

    ajaxRequestFail() {
        this.openFailModal();
        this.openCartOverlay();
    }

    renderCartModal(product) {
        this.clearCartModal();
        let productVariant = product.variant_title;
        if (productVariant === null) {
            productVariant = '';
        } else {
            productVariant = `(${productVariant})`;
        }
        const cartSingleProduct = `
        <div class="go-cart-modal-item">
            <div class="go-cart-item__image" style="background-image: url(${product.image});"></div>
            <div class="go-cart-item__info">
                <a href="${product.url}" class="go-cart-item__title">${product.product_title} ${productVariant}</a> ${this.labelAddedToCart}
            </div>
        </div>
      `;
        this.cartModalContent.innerHTML += cartSingleProduct;
    }

    renderDrawerCart(cart) {
        this.progressContainer.classList.remove('hide');
        this.clearCartDrawer();
        cart.items.forEach((item, index) => {
            let itemVariant = item.variant_title;
            if (itemVariant === null) {
                itemVariant = '';
            }
            const cartSingleProduct = `
        <div class="go-cart-item__single" data-line="${Number(index + 1)}">
            <div class="go-cart-item__info-wrapper">
                <div class="go-cart-item__image" style="background-image: url(${item.image});"></div>
                <div class="go-cart-item__info">
                    <a href="${item.url}" class="go-cart-item__title">${item.product_title}</a>
                    <div class="go-cart-item__variant">${itemVariant}</div>
                    <div class="go-cart-item__quantity">
                        <span class="go-cart-item__quantity-label">${this.labelQuantity} </span>
                        <span class="go-cart-item__quantity-button js-go-cart-quantity-minus">-</span>
                        <input class="go-cart-item__quantity-number js-go-cart-quantity" type="number" value="${item.quantity}" disabled>
                        <span class="go-cart-item__quantity-button js-go-cart-quantity-plus">+</span>
                    </div>
                </div>
            </div>
            <div class="go-cart-item__price">${formatMoney(item.line_price, this.moneyFormat)}</div>
            <a class="go-cart-item__remove ${this.removeFromCartNoDot}">${this.labelRemove}</a>
        </div>
      `;
            this.cartDrawerContent.innerHTML += cartSingleProduct;
        });
        this.cartDrawerSubTotal.innerHTML = formatMoney(cart.total_price, this.moneyFormat);
        this.cartDrawerSubTotal.parentNode.classList.remove('is-invisible');
        const removeFromCart = document.querySelectorAll(this.removeFromCart);
        removeFromCart.forEach((item) => {
            item.addEventListener('click', () => {
                GoCart.removeItemAnimation(item.parentNode);
                const line = item.parentNode.getAttribute('data-line');
                this.removeItem(line);
            });
        });
        const itemQuantityPlus = document.querySelectorAll(this.itemQuantityPlus);
        itemQuantityPlus.forEach((item) => {
            item.addEventListener('click', () => {
                const line = item.parentNode.parentNode.parentNode.parentNode.getAttribute('data-line');
                const quantity = Number(item.parentNode.querySelector(this.itemQuantity).value) + 1;
                this.changeItemQuantity(line, quantity);
            });
        });
        const itemQuantityMinus = document.querySelectorAll(this.itemQuantityMinus);
        itemQuantityMinus.forEach((item) => {
            item.addEventListener('click', () => {
                const line = item.parentNode.parentNode.parentNode.parentNode.getAttribute('data-line');
                const quantity = Number(item.parentNode.querySelector(this.itemQuantity).value) - 1;
                this.changeItemQuantity(line, quantity);
                if (Number((item.parentNode.querySelector(this.itemQuantity).value - 1)) === 0) {
                    GoCart.removeItemAnimation(item.parentNode.parentNode.parentNode.parentNode);
                }
            });
        });
        //**/ ---------------------------------- /**//
        //**/ ----------CUSTOMISATIONS----------/**//
        //**/ ---------------------------------- /**//
        let total_price = 0;
        const progressBar = document.getElementById('progress-bar');
        const promotion_trigger= document.body.getAttribute('data-promotion-trigger');
        const promotion_reward = document.body.getAttribute('data-promotion-reward');
        const promotion_message = document.getElementById('promotion-message');

        cart.items.map((cart_item) => {
            total_price += cart_item.line_price;
        })

        // UPDATE PROGRESS BAR
        if(progressBar) {
            progressBar.setAttribute('style', `--progress: ${((total_price / promotion_trigger)).toFixed(2)}%;`)
        }

        // UPDATE PROGRESS MESSAGE
        if(total_price > Number(promotion_trigger * 100)) {
            promotion_message.innerHTML = `You've qualified for ${promotion_reward}`;
        } else {
            promotion_message.innerHTML = `You're ${formatMoney(Number(promotion_trigger * 100) - total_price)} away from ${promotion_reward}`;
        }

        document.querySelector('.go-cart__drawer').setAttribute('data-cart-total', total_price);
    }

    renderMiniCart(cart) {
        this.progressContainer.classList.remove('hide');
        this.clearMiniCart();
        cart.items.forEach((item, index) => {
            let itemVariant = item.variant_title;
            if (itemVariant === null) {
                itemVariant = '';
            }
            const cartSingleProduct = `
        <div class="go-cart-item__single" data-line="${Number(index + 1)}">
            <div class="go-cart-item__info-wrapper">
                <div class="go-cart-item__image" style="background-image: url(${item.image});"></div>
                <div class="go-cart-item__info">
                    <a href="${item.url}" class="go-cart-item__title">${item.product_title}</a>
                    <div class="go-cart-item__variant">${itemVariant}</div>
                    <div class="go-cart-item__quantity">
                        <span class="go-cart-item__quantity-label">${this.labelQuantity} </span>
                        <span class="go-cart-item__quantity-button js-go-cart-quantity-minus">-</span>
                        <input class="go-cart-item__quantity-number js-go-cart-quantity" type="number" value="${item.quantity}" disabled>
                        <span class="go-cart-item__quantity-button js-go-cart-quantity-plus">+</span>
                    </div>
                </div>
            </div>
            <div class="go-cart-item__price">${formatMoney(item.line_price, this.moneyFormat)}</div>
            <a class="go-cart-item__remove ${this.removeFromCartNoDot}">${this.labelRemove}</a>
        </div>
      `;
            this.cartMiniCartContent.innerHTML += cartSingleProduct;
        });
        this.cartMiniCartSubTotal.innerHTML = formatMoney(cart.total_price, this.moneyFormat);
        this.cartMiniCartSubTotal.parentNode.classList.remove('is-invisible');
        const removeFromCart = document.querySelectorAll(this.removeFromCart);
        removeFromCart.forEach((item) => {
            item.addEventListener('click', () => {
                GoCart.removeItemAnimation(item.parentNode);
                const line = item.parentNode.getAttribute('data-line');
                this.removeItem(line);
            });
        });
        const itemQuantityPlus = document.querySelectorAll(this.itemQuantityPlus);
        itemQuantityPlus.forEach((item) => {
            item.addEventListener('click', () => {
                const line = item.parentNode.parentNode.parentNode.parentNode.getAttribute('data-line');
                const quantity = Number(item.parentNode.querySelector(this.itemQuantity).value) + 1;
                this.changeItemQuantity(line, quantity);
            });
        });
        const itemQuantityMinus = document.querySelectorAll(this.itemQuantityMinus);
        itemQuantityMinus.forEach((item) => {
            item.addEventListener('click', () => {
                const line = item.parentNode.parentNode.parentNode.parentNode.getAttribute('data-line');
                const quantity = Number(item.parentNode.querySelector(this.itemQuantity).value) - 1;
                this.changeItemQuantity(line, quantity);
                if (Number((item.parentNode.querySelector(this.itemQuantity).value - 1)) === 0) {
                    GoCart.removeItemAnimation(item.parentNode.parentNode.parentNode.parentNode);
                }
            });
        });
    }

    renderBlankCartDrawer() {
        this.cartDrawerSubTotal.parentNode.classList.add('is-invisible');
        this.clearCartDrawer();
        this.cartDrawerContent.innerHTML = `<div class="go-cart__empty">${this.labelCartIsEmpty}</div>`;
        this.progressContainer.classList.add('hide');
    }

    renderBlankMiniCart() {
        this.cartMiniCartSubTotal.parentNode.classList.add('is-invisible');
        this.clearMiniCart();
        this.cartMiniCartContent.innerHTML = `<div class="go-cart__empty">${this.labelCartIsEmpty}</div>`;
    }

    clearCartDrawer() {
        this.cartDrawerContent.innerHTML = '';
    }

    clearMiniCart() {
        this.cartMiniCartContent.innerHTML = '';
    }

    clearCartModal() {
        this.cartModalContent.innerHTML = '';
    }

    openCartDrawer() {
        this.cartDrawer.classList.add('is-open');
    }

    closeCartDrawer() {
        this.cartDrawer.classList.remove('is-open');
    }

    openMiniCart() {
        this.cartMiniCart.classList.add('is-open');
    }

    closeMiniCart() {
        this.cartMiniCart.classList.remove('is-open');
    }

    openFailModal() {
        this.cartModalFail.classList.add('is-open');
    }

    closeFailModal() {
        this.cartModalFail.classList.remove('is-open');
    }

    openCartModal() {
        this.cartModal.classList.add('is-open');
    }

    closeCartModal() {
        this.cartModal.classList.remove('is-open');
    }

    openCartOverlay() {
        this.cartOverlay.classList.add('is-open');
    }

    closeCartOverlay() {
        this.cartOverlay.classList.remove('is-open');
    }

    static removeItemAnimation(item) {
        item.classList.add('is-invisible');
    }

    setDrawerDirection() {
        this.cartDrawer.classList.add(`go-cart__drawer--${this.drawerDirection}`);
    }

}

export default GoCart;
