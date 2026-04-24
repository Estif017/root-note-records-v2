function showLoginForm() {
	templateBuilder.build('login-form', {}, 'login');
}

function hideModalForm() {
	templateBuilder.clear('login');
}

function login() {
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;

	userService.login(username, password);
	hideModalForm();
}

function showImageDetailForm(product, imageUrl) {
	const imageDetail = {
		name: product,
		imageUrl: imageUrl,
	};

	templateBuilder.build('image-detail', imageDetail, 'login');
}

function loadHome() {
	templateBuilder.build('home', {}, 'main');

	productService.search();
	categoryService.getAllCategories(loadCategories);
}

function editProfile() {
	profileService.loadProfile();
}

function saveProfile() {
	const firstName = document.getElementById('firstName').value;
	const lastName = document.getElementById('lastName').value;
	const phone = document.getElementById('phone').value;
	const email = document.getElementById('email').value;
	const address = document.getElementById('address').value;
	const city = document.getElementById('city').value;
	const state = document.getElementById('state').value;
	const zip = document.getElementById('zip').value;

	const profile = {
		firstName,
		lastName,
		phone,
		email,
		address,
		city,
		state,
		zip,
	};

	profileService.updateProfile(profile);
}

function showCart() {
	cartService.loadCartPage();
}

function clearCart() {
	cartService.clearCart();
	cartService.loadCartPage();
}

function setCategory(control) {
	productService.addCategoryFilter(control.value);
	productService.search();
}

function setSubcategory(control) {
	productService.addSubcategoryFilter(control.value);
	productService.search();
}

function setMinPrice(control) {
	// const slider = document.getElementById("min-price");
	const label = document.getElementById('min-price-display');
	label.innerText = control.value;

	const value = control.value != 0 ? control.value : '';
	productService.addMinPriceFilter(value);
	productService.search();
}

function setMaxPrice(control) {
	// const slider = document.getElementById("min-price");
	const label = document.getElementById('max-price-display');
	label.innerText = control.value;

	const value = control.value != 500 ? control.value : '';
	productService.addMaxPriceFilter(value);
	productService.search();
}

function closeError(control) {
	setTimeout(() => {
		control.click();
	}, 3000);
}

function closeRecommendationsModal() {
	const modalEl = document.getElementById('recommendations-modal');
	modalEl.style.display = 'none';
	modalEl.classList.remove('show');
	document.body.classList.remove('modal-open');
	const backdrop = document.getElementById('rec-backdrop');
	if (backdrop) backdrop.remove();
}

document.addEventListener('DOMContentLoaded', () => {
	loadHome();
});

async function loadRecommendations(productId) {
	// When called from the header with no productId, pick a random displayed product
	if (!productId) {
		const btns = document.querySelectorAll('.btn-rec');
		if (!btns.length) return;
		const random = btns[Math.floor(Math.random() * btns.length)];
		const match = random.getAttribute('onclick').match(/\d+/);
		if (!match) return;
		productId = parseInt(match[0]);
	}

	// Show modal immediately with a spinner while fetching
	const modalEl = document.getElementById('recommendations-modal');
	const container = document.getElementById('recommendations-container');
	container.innerHTML = '<div class="rec-loading">Finding recommendations…</div>';
	modalEl.style.display = 'block';
	modalEl.classList.add('show');
	document.body.classList.add('modal-open');
	const backdrop = document.createElement('div');
	backdrop.className = 'modal-backdrop fade show';
	backdrop.id = 'rec-backdrop';
	document.body.appendChild(backdrop);
	backdrop.addEventListener('click', closeRecommendationsModal);
	modalEl.querySelector('[data-dismiss="modal"]').onclick = closeRecommendationsModal;

	const recommendations = await getRecommendations(productId);
	if (!recommendations.length) {
		container.innerHTML = '<p class="rec-empty">No recommendations found.</p>';
		return;
	}
	templateBuilder.build('recommendations', { recommendations }, 'recommendations-container');
}
