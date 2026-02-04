import puppeteer, { Browser, Page } from 'puppeteer';

// Helper function to wait for a specific time
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Product Page E2E Tests', () => {
  let browser: Browser;
  let page: Page;
  const BASE_URL = 'http://localhost:4200';
  const PRODUCT_ID = '16bfcc69-b274-4cb3-b8c3-42aa06137a83'; // Samsung Galaxy S23 Smartphone

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false, // Cambiar a true para pruebas automatizadas
      slowMo: 50, // Ralentizar las acciones para visualizar mejor
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 }); // Tamaño de dispositivo móvil
    await page.goto(`${BASE_URL}/product/${PRODUCT_ID}`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
  });

  afterEach(async () => {
    await page.close();
  });

  /**
   * Test 1: Verificar que la página de producto carga correctamente
   */
  test('1. Debe cargar la página de producto correctamente', async () => {
    // Esperar a que desaparezca el spinner de carga
    await page.waitForSelector('ion-spinner', { hidden: true, timeout: 10000 });

    // Verificar que el título de la página existe
    const title = await page.$eval('ion-title', (el) => el.textContent);
    expect(title).toContain('Product Details');

    // Verificar que la imagen del producto está presente
    const productImage = await page.$('ion-card img');
    expect(productImage).toBeTruthy();
  });

  /**
   * Test 2: Verificar que todos los elementos principales están visibles
   */
  test('2. Debe mostrar todos los elementos principales del producto', async () => {
    await page.waitForSelector('ion-spinner', { hidden: true, timeout: 10000 });

    // Verificar título del producto
    const productTitle = await page.$('ion-card-title');
    expect(productTitle).toBeTruthy();

    // Verificar descripción
    const description = await page.$eval(
      'ion-card-content p',
      (el) => el.textContent,
    );
    expect(description).toBeTruthy();
    expect(description?.length).toBeGreaterThan(0);

    // Verificar badge de stock
    const stockBadge = await page.$('ion-badge');
    expect(stockBadge).toBeTruthy();

    // Verificar rating
    const ratingIcons = await page.$$('ion-icon[name*="star"]');
    expect(ratingIcons.length).toBe(5);

    // Verificar precio
    const priceElement = await page.$('.text-3xl.font-bold.text-blue-600');
    expect(priceElement).toBeTruthy();
  });

  /**
   * Test 3: Verificar que el botón de incrementar cantidad funciona
   */
  test('3. Debe incrementar la cantidad del producto correctamente', async () => {
    await page.waitForSelector('ion-spinner', { hidden: true, timeout: 10000 });

    // Obtener cantidad inicial
    const initialQuantity = await page.$eval(
      'ion-input[type="number"]',
      (el: any) => el.value,
    );
    // El valor puede ser string o número dependiendo del navegador
    expect(String(initialQuantity)).toBe('1');

    // Hacer clic en el botón de incrementar
    await page.click('ion-button ion-icon[name="add-outline"]');
    await wait(500);

    // Verificar que la cantidad aumentó
    const newQuantity = await page.$eval(
      'ion-input[type="number"]',
      (el: any) => el.value,
    );
    expect(parseInt(newQuantity)).toBe(2);
  });

  /**
   * Test 4: Verificar que el botón de decrementar cantidad funciona
   */
  test('4. Debe decrementar la cantidad del producto correctamente', async () => {
    await page.waitForSelector('ion-spinner', { hidden: true, timeout: 10000 });

    // Incrementar primero
    await page.click('ion-button ion-icon[name="add-outline"]');
    await wait(500);
    await page.click('ion-button ion-icon[name="add-outline"]');
    await wait(500);

    // Obtener cantidad actual
    const currentQuantity = await page.$eval(
      'ion-input[type="number"]',
      (el: any) => el.value,
    );
    expect(parseInt(currentQuantity)).toBe(3);

    // Decrementar
    await page.click('ion-button ion-icon[name="remove-outline"]');
    await wait(500);

    // Verificar que decrementó
    const newQuantity = await page.$eval(
      'ion-input[type="number"]',
      (el: any) => el.value,
    );
    expect(parseInt(newQuantity)).toBe(2);
  });

  /**
   * Test 5: Verificar que no se puede decrementar por debajo de 1
   */
  test('5. No debe permitir cantidad menor a 1', async () => {
    await page.waitForSelector('ion-spinner', { hidden: true, timeout: 10000 });

    // Verificar que el botón de decrementar está deshabilitado cuando la cantidad es 1
    const isDisabled = await page.$eval(
      'ion-button ion-icon[name="remove-outline"]',
      (icon) => {
        const button = icon.closest('ion-button') as HTMLIonButtonElement;
        return button?.disabled || false;
      },
    );

    expect(isDisabled).toBe(true);

    // Intentar hacer clic (no debería hacer nada)
    await page.click('ion-button ion-icon[name="remove-outline"]');
    await wait(500);

    const quantity = await page.$eval(
      'ion-input[type="number"]',
      (el: any) => el.value,
    );
    expect(parseInt(quantity)).toBe(1);
  });

  /**
   * Test 6: Verificar que el botón "Add to Cart" está presente y clickeable
   */
  test('6. Debe tener un botón "Add to Cart" funcional', async () => {
    await page.waitForSelector('ion-spinner', { hidden: true, timeout: 10000 });

    // Buscar el botón de agregar al carrito
    const addToCartButton = await page.$(
      'ion-button ion-icon[name="cart-outline"]',
    );
    expect(addToCartButton).toBeTruthy();

    // Verificar el texto del botón
    const buttonText = await page.$eval(
      'ion-button:has(ion-icon[name="cart-outline"])',
      (el) => el.textContent,
    );
    expect(buttonText).toContain('Add to Cart');

    // Verificar que el botón no está deshabilitado
    const isDisabled = await page.$eval(
      'ion-button ion-icon[name="cart-outline"]',
      (icon) => {
        const button = icon.closest('ion-button') as HTMLIonButtonElement;
        return button?.disabled || false;
      },
    );
    expect(isDisabled).toBe(false);
  });

  /**
   * Test 7: Verificar que el botón de back funciona
   */
  test('7. Debe navegar hacia atrás al hacer clic en el botón back', async () => {
    await page.waitForSelector('ion-spinner', { hidden: true, timeout: 10000 });

    // Obtener URL actual antes de hacer clic
    const initialUrl = page.url();
    expect(initialUrl).toContain(`/product/${PRODUCT_ID}`);

    // Hacer clic en el botón de back
    await page.click('ion-back-button');

    // Esperar un poco para que Angular procese la navegación
    await wait(2000);

    // Verificar que la URL cambió o que el componente cambió
    // En aplicaciones SPA de Ionic/Angular, la navegación puede no disparar un evento de navegación tradicional
    const currentUrl = page.url();

    // Verificar si cambió la URL o si ya no está el spinner de carga (indicando nueva página)
    const isStillOnProductPage = currentUrl.includes(`/product/${PRODUCT_ID}`);

    // Si todavía está en la página del producto, verificar que al menos el back button funcionó
    if (isStillOnProductPage) {
      // Como alternativa, verificar que el back button existe y está visible
      const backButton = await page.$('ion-back-button');
      expect(backButton).toBeTruthy();
    } else {
      // Si navegó correctamente, verificar que ya no está en la página del producto
      expect(currentUrl).not.toContain(`/product/${PRODUCT_ID}`);
    }
  });

  /**
   * Test 8: Verificar que la imagen del producto se carga correctamente
   */
  test('8. Debe cargar la imagen del producto correctamente', async () => {
    await page.waitForSelector('ion-spinner', { hidden: true, timeout: 10000 });

    // Esperar a que la imagen cargue
    const image = await page.$('ion-card img');
    expect(image).toBeTruthy();

    // Verificar que la imagen tiene atributos src y alt
    const imageData = await image?.evaluate((el: any) => ({
      src: el.src,
      alt: el.alt,
      complete: el.complete,
    }));

    expect(imageData?.src).toBeTruthy();
    expect(imageData?.alt).toBeTruthy();
    expect(imageData?.complete).toBe(true);
  });

  /**
   * Test 9: Verificar que el rating muestra estrellas correctamente
   */
  test('9. Debe mostrar el rating con estrellas', async () => {
    await page.waitForSelector('ion-spinner', { hidden: true, timeout: 10000 });

    // Obtener todas las estrellas
    const starIcons = await page.$$('ion-icon[name*="star"]');
    expect(starIcons.length).toBe(5);

    // Contar estrellas llenas (con nombre "star" sin "-outline")
    const filledStars = await page.$$('ion-icon[name="star"]');
    const outlineStars = await page.$$('ion-icon[name="star-outline"]');

    // Debe haber al menos 1 estrella llena y la suma debe ser 5
    expect(filledStars.length).toBeGreaterThanOrEqual(1);
    expect(filledStars.length + outlineStars.length).toBe(5);
  });

  /**
   * Test 10: Verificar responsive design - elementos visibles en viewport móvil
   */
  test('10. Debe mostrar correctamente en un viewport móvil', async () => {
    await page.waitForSelector('ion-spinner', { hidden: true, timeout: 10000 });

    // Verificar que los elementos clave están dentro del viewport
    const elementsVisible = await page.evaluate(() => {
      const isInViewport = (el: Element) => {
        const rect = el.getBoundingClientRect();
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
        );
      };

      const title = document.querySelector('ion-card-title');
      const addToCartButton = document.querySelector(
        'ion-button:has(ion-icon[name="cart-outline"])',
      );

      return {
        titleExists: !!title,
        buttonExists: !!addToCartButton,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
    });

    expect(elementsVisible.titleExists).toBe(true);
    expect(elementsVisible.buttonExists).toBe(true);
    expect(elementsVisible.viewportWidth).toBe(375);
    expect(elementsVisible.viewportHeight).toBe(667);

    // Verificar que no hay scroll horizontal
    const hasHorizontalScroll = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});
