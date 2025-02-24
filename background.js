chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ isOn: true });
});

chrome.webNavigation.onCommitted.addListener(function (details) {
    chrome.storage.sync.get('isOn', function (data) {
        if (data.isOn) {
            chrome.tabs.executeScript(details.tabId, {
                code: `
                let script = async () => {
    // Function to create a delay
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Function to click an element after a delay
    function clickElementWithDelay(element) {
        // Check if the element is already focused
        if (document.activeElement !== element) {
            // Dispatch focus event for buttons and links
            element.dispatchEvent(new Event('focus', { bubbles: true }));
        }

        // Introduce a delay before clicking
        setTimeout(() => {
            // Dispatch mouse events for buttons and links
            element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }, 1500); // Wait for 1500 milliseconds

        return 'Element clicked: ' + element.textContent.trim();
    }

    // Function to get the current URL
    function getCurrentUrl() {
        return window.location.href;
    }

    // Main processing function
    async function processCheckout() {
        let previousUrl = getCurrentUrl();

        // Array of selectors to search for checkboxes, buttons, and links
        const checkboxSelectors = [
            'input[type="checkbox"]', // Include all checkbox inputs first
        ];

        const buttonSelectors = [
            '#CartDrawer-Checkout', // Include the specific button
            '.button.cart-checkout',
            '.button.w-full',
            '.button.view-cart-btn',
            '#checkout-btn', // Include the button with ID checkout-btn
            'button[name="checkout"]', // Include buttons with name checkout
            '.jsx-1419935601.Button.Button--default.Subtotal__view-cart.Button--full-width',
            '.btn.my-4.py-3',
            'a.button.primary.large.text-center.w-full',
            '.btn.btn--regular.btn--color.btn--fill',
            'a' // Include all <a> elements
        ];

        // Try to find and check each checkbox
        let checkboxFound = false;
        for (const selector of checkboxSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                const titleContent = element.title ? element.title.trim().toLowerCase() : '';

                // Check if the element is a checkbox
                if (element.tagName.toLowerCase() === 'input' && element.type === 'checkbox') {
                    // Check if the checkbox should be checked
                    if (element.classList.contains('rterms-checkbox') ||
                        element.name === 'attributes[I-Agree-To-Terms]' ||
                        titleContent.includes('agree to the terms and refund policy') ||
                        element.id === 'checkout-terms') {
                        if (!element.checked) {
                            // Click the checkbox
                            clickElementWithDelay(element);
                            checkboxFound = true; // Mark that a checkbox was found
                            break; // Exit the loop after checking the checkbox
                        } else {
                            checkboxFound = true; // Checkbox is already checked
                        }
                    }
                }
            }
        }

        // Proceed to find and click buttons and links regardless of checkbox state
        for (const selector of buttonSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                const textContent = element.textContent.trim().toLowerCase();

                // Check for buttons and links containing "checkout" or "check out"
                if (element.tagName.toLowerCase() === 'button' || element.tagName.toLowerCase() === 'a') {
                    if (textContent.includes('checkout') || textContent.includes('check out')) {
                        // Call the click function with delay
                        clickElementWithDelay(element);
                        return 'Button clicked: ' + textContent; // Return the clicked button text
                    }
                }
            }
        }

        return 'No matching element found';
    }

    // Main loop to process checkout
    let previousUrl = getCurrentUrl(); // Initialize previousUrl
    while (true) {
        const result = await processCheckout();
        console.log(result); // Log the result of the evaluation

        // Check the current URL after clicking
        const currentUrl = getCurrentUrl();
        if (previousUrl === currentUrl) {
            console.log('URL has not changed, retrying in 5000 milliseconds...');
            await delay(5000); // Wait for 5000 milliseconds
        } else {
            console.log('URL changed, exiting loop.');
            break; // Exit the loop if the URL has changed
        }
    }
};

script();
                `
            });
        }
    });
});