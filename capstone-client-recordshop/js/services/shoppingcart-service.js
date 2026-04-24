let cartService;

class ShoppingCartService {
	cart = {
		items: [],
		total: 0,
	};

	/* =========================
     Helpers
  ========================= */

	showSuccess(message) {
		templateBuilder.append('message', { message }, 'messages');

		setTimeout(() => {
			const container = document.getElementById('messages');
			if (container?.lastElementChild) {
				container.lastElementChild.remove();
			}
		}, 2000);
	}

	showError(message) {
		templateBuilder.append('error', { error: message }, 'errors');
	}

	/* =========================
     API Calls
  ========================= */

	addToCart(productId) {
		const url = `${config.baseUrl}/cart/products/${productId}`;

		axios
			.post(url, {})
			.then((response) => {
				this.setCart(response.data);
				this.updateCartDisplay();
				this.showSuccess('Added to cart.');
				// this.loadCartPage();
			})
			.catch((error) => {
				const msg =
					error?.response?.data?.error ||
					error?.response?.data?.message ||
					error.message ||
					'Add to cart failed.';
				this.showError(msg);
			});
	}

	updateQuantity(productId, quantity) {
		const url = `${config.baseUrl}/cart/products/${productId}`;

		axios
			.put(url, { quantity })
			.then((response) => {
				this.setCart(response.data);
				this.updateCartDisplay();
				this.loadCartPage();
				this.showSuccess('Cart updated.');
			})
			.catch((error) => {
				const msg =
					error?.response?.data?.error ||
					error?.response?.data?.message ||
					error.message ||
					'Update cart failed.';
				this.showError(msg);
			});
	}

	removeFromCart(productId) {
		this.updateQuantity(productId, 0);
	}

	clearCart() {
		const url = `${config.baseUrl}/cart`;

		axios
			.delete(url)
			.then((response) => {
				this.setCart(response.data);
				this.updateCartDisplay();
				this.loadCartPage();
				this.showSuccess('Cart cleared.');
			})
			.catch((error) => {
				const msg =
					error?.response?.data?.error ||
					error?.response?.data?.message ||
					error.message ||
					'Clear cart failed.';
				this.showError(msg);
			});
	}

	loadCart() {
		const url = `${config.baseUrl}/cart`;

		axios
			.get(url)
			.then((response) => {
				this.setCart(response.data);
				this.updateCartDisplay();
			})
			.catch((error) => {
				const msg =
					error?.response?.data?.error ||
					error?.response?.data?.message ||
					error.message ||
					'Load cart failed.';
				this.showError(msg);
			});
	}
	checkout() {
		const url = `${config.baseUrl}/orders`;

		axios
			.post(url, {})
			.then((response) => {
				// backend should return the created order
				this.cart = { items: [], total: 0 };
				this.updateCartDisplay();
				this.loadCartPage();

				this.showSuccess('Order placed successfully!');
			})
			.catch((error) => {
				const msg =
					error?.response?.data?.error ||
					error?.response?.data?.message ||
					error.message ||
					'Checkout failed.';
				this.showError(msg);
			});
	}

	/* =========================
     State Management
  ========================= */

	setCart(data) {
		this.cart = {
			items: [],
			total: data.total || 0,
		};

		for (const value of Object.values(data.items || {})) {
			this.cart.items.push(value);
		}
	}

	updateCartDisplay() {
		try {
			const cartControl = document.getElementById('cart-items');
			// display total quantity (include duplicates)
			const totalQty = (this.cart.items || []).reduce((sum, it) => {
				const q = Number(it.quantity || 0);
				return sum + (isNaN(q) ? 0 : q);
			}, 0);
			if (cartControl) cartControl.innerText = totalQty;
		} catch (e) {}
	}

	/* =========================
     Cart Page Rendering
  ========================= */

	loadCartPage() {
		const main = document.getElementById('main');
		main.innerHTML = '';

		const contentDiv = document.createElement('div');
		contentDiv.id = 'content';
		contentDiv.classList.add('content-form');

		const header = document.createElement('div');
		header.classList.add('cart-header');

		const h1 = document.createElement('h1');
		h1.innerText = 'Cart';
		header.appendChild(h1);

		const clearBtn = document.createElement('button');
		clearBtn.classList.add('btn', 'btn-danger');
		clearBtn.innerText = 'Clear';
		clearBtn.disabled = this.cart.items.length === 0;
		clearBtn.addEventListener('click', () => this.clearCart());
		header.appendChild(clearBtn);

		contentDiv.appendChild(header);

		if (this.cart.items.length === 0) {
			const empty = document.createElement('p');
			empty.innerText = 'Your cart is empty.';
			contentDiv.appendChild(empty);
			main.appendChild(contentDiv);
			return;
		}

		this.cart.items.forEach((item) => {
			this.buildItem(item, contentDiv);
		});

		const totalDiv = document.createElement('div');
		totalDiv.classList.add('cart-total');

		const totalH3 = document.createElement('h3');
		totalH3.innerText = `Total: $${Number(this.cart.total).toFixed(2)}`;
		totalDiv.appendChild(totalH3);

		contentDiv.appendChild(totalDiv);
		main.appendChild(contentDiv);

		const footer = document.createElement('div');
		footer.classList.add('cart-footer');
		footer.style.display = 'flex';
		footer.style.justifyContent = 'space-between';
		footer.style.alignItems = 'center';
		footer.style.marginTop = '20px';

		const totalLabel = document.createElement('h3');
		totalLabel.innerText = `Total: $${Number(this.cart.total).toFixed(2)}`;

		const checkoutButton = document.createElement('button');
		checkoutButton.classList.add('btn', 'btn-success');
		checkoutButton.innerText = 'Checkout';
		checkoutButton.disabled = this.cart.items.length === 0;

		checkoutButton.addEventListener('click', () => {
			this.checkout();
		});

		footer.appendChild(totalLabel);
		footer.appendChild(checkoutButton);

		contentDiv.appendChild(footer);
		main.appendChild(contentDiv);
	}

	buildItem(item, parent) {
		const productId = item.product.productId;

		const outer = document.createElement('div');
		outer.classList.add('cart-item');

		const img = document.createElement('img');
		img.src = `images/products/${item.product.imageUrl}`;
		img.alt = item.product.name;

		// details column (name, price, description)
		const details = document.createElement('div');
		details.classList.add('details');

		const name = document.createElement('h4');
		name.innerText = item.product.name;

		const price = document.createElement('p');
		price.classList.add('price');
		price.innerText = `$${Number(item.product.price).toFixed(2)}`;

		const desc = document.createElement('p');
		desc.classList.add('description');
		desc.innerText = item.product.description;

		details.append(name, price, desc);

		const controls = document.createElement('div');
		controls.classList.add('quantity-controls');

		const minus = document.createElement('button');
		minus.classList.add('btn', 'btn-sm');
		minus.innerText = '-';

		const qty = document.createElement('span');
		qty.classList.add('item-qty');
		qty.dataset.productId = productId;
		qty.innerText = item.quantity;

		const plus = document.createElement('button');
		plus.classList.add('btn', 'btn-sm');
		plus.innerText = '+';

		// read current qty from the DOM so clicks reflect current state
		minus.addEventListener('click', () => {
			const current = Number(qty.innerText || 0);
			this.updateQuantity(productId, Math.max(0, current - 1));
		});
		plus.addEventListener('click', () => {
			const current = Number(qty.innerText || 0);
			this.updateQuantity(productId, current + 1);
		});

		const remove = document.createElement('button');
		remove.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-btn');
		remove.innerText = 'Remove';
		remove.addEventListener('click', () => this.removeFromCart(productId));

		// place controls under price inside details and include Remove next to +
		const controlsRow = document.createElement('div');
		controlsRow.classList.add('quantity-controls');
		controlsRow.append(minus, qty, plus, remove);

		details.append(controlsRow, desc);

		outer.append(img, details);
		parent.appendChild(outer);
	}
}

/* =========================
   Init
========================= */

document.addEventListener('DOMContentLoaded', () => {
	cartService = new ShoppingCartService();

	if (userService.isLoggedIn()) {
		cartService.loadCart();
	}
});
