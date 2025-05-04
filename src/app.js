let wishlistItems = [];      

const wishForm = document.getElementById('wishForm');
const wishlistContainer = document.getElementById('wishlist');
const addModal = document.getElementById('addModal');
const imageModal = document.getElementById('imageModal');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const editForm = document.getElementById('editForm');
const portifolioModal = document.getElementById('portifolioModal');
const notification = document.getElementById('notification');
const configForm = document.getElementById('configForm');
const accentColor = document.getElementById('accentColor');


document.addEventListener('DOMContentLoaded', () => {
    loadWishlistItems();
    renderWishlist();
    loadAccentColor(localStorage.getItem('accentColor'));
});

function loadAccentColor(hex) {
    if (localStorage.getItem('accentColor')){
        localStorage.setItem('accentColor', hex);
        const hexColor = localStorage.getItem('accentColor');
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        document.documentElement.style.setProperty('--accent-color', `rgb(${r}, ${g}, ${b})`);
        document.documentElement.style.setProperty('--accent-color-rgb', `${r}, ${g}, ${b}`);
        document.documentElement.style.setProperty('--secondary-color', `rgba(${r}, ${g}, ${b}, 0.8)`);
        console.log(document.documentElement.style.getPropertyValue('--secondary-color'));
    } else {localStorage.setItem('accentColor', '#9c27b0'); loadAccentColor(localStorage.getItem('accentColor'));}
    accentColor.value = localStorage.getItem('accentColor');
}

function saveWishlistItems() {
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
}

function loadWishlistItems() {
    const savedItems = localStorage.getItem('wishlistItems');
    if (savedItems) {
        wishlistItems = JSON.parse(savedItems);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

wishForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const itemName = document.getElementById('itemName').value;
    const itemLink = document.getElementById('itemLink').value;
    const itemImage = document.getElementById('itemImage').value;
    const itemPrice = document.getElementById('itemPrice').value;

    
    const newItem = {
        id: generateId(),
        name: itemName,
        price: itemPrice,
        link: itemLink,
        image: itemImage,
    };
    
    wishlistItems.push(newItem);
    saveWishlistItems();    
    renderWishlist();
    closeModal();
    
    wishForm.reset();6
            
    showNotification('item added successfully!');
});

function priceFormat(item){
    if (!(item.price.includes(','))){
        return item.price += ',00'; 
    }   else {
        const [inteiro, decimal] = item.price.split(',')
         if (decimal.length === 1){
            return item.price += '0';
         } else if (decimal.length === 0){
            return item.price += '00';
         }
    }

    return item.price;
}

accentColor.addEventListener('input', function() {
    loadAccentColor(this.value);
});

configForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const configFile = document.getElementById('configFile').value;
    
    wishlistItems = JSON.parse(configFile);
    renderWishlist();
    
    configForm.reset();
    
    showNotification('config imported successfully!');
});

document.getElementById('export').addEventListener('click', () => {
    const configFile = JSON.stringify(wishlistItems);

    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = configFile;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);

    showNotification('config exported to clipboard successfully!');
});

document.getElementById('save').addEventListener('click', () => {
    saveWishlistItems()
    loadWishlistItems();
    renderWishlist();

    showNotification('config saved successfully!');
});


document.querySelectorAll('.price').forEach(function(e) {
    new Cleave(e, {
      numeral: true,
      numeralThousandsGroupStyle: 'thousand',
      numeralDecimalMark: ',',
      delimiter: '.',
      prefix: 'R$',
      numeralDecimalScale: 2,
      numeralPositiveOnly: true,
      rawValueTrimPrefix: true,
    }); 
  });

function renderWishlist() {
    wishlistContainer.innerHTML = '';

    if (wishlistItems.length === 0)
        wishlistContainer.classList.add('empty-state');
    else
        wishlistContainer.classList.remove('empty-state');

    wishlistItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'wishlist-item';



        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" role="button" onclick="openImageModal('${item.id}')" class="item-image" onerror="this.onerror=null;this.src='https://corhexa.com/png/300x200/191919';">
            <div class="item-content">
                <h3 class="item-name">${item.name}</h3>
                <h3 class="item-price">${priceFormat(item)}</h3>
                <a href="${item.link}" target="_blank" class="item-link">${item.link}</a>
                <div class="item-actions">
                    <button onclick="openEditModal('${item.id}')" class="btn-secondary">edit</button>
                    <button onclick="openDeleteModal('${item.id}')" class="btn-danger">remove</button>
                </div>
            </div>
        `;
        wishlistContainer.appendChild(itemElement);
    });

    const addElement = document.createElement('div');
    addElement.className = 'add-item';
    addElement.addEventListener('click', () => {
        addModal.classList.add('active');
    });
    wishlistContainer.appendChild(addElement);

    // i've used claude to make this drag&drop system :3
    if (wishlistItems.length > 1) {
        if (wishlistSortable) {
          wishlistSortable.destroy();
        }
        
        wishlistSortable = new Sortable(wishlistContainer, {
          animation: 150,
          handle: '.wishlist-item',
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          filter: '.add-item',
          onMove: function(evt) {
            const targetEl = evt.related;
            if (targetEl && targetEl.classList.contains('add-item')) {
              return false; 
            }
            return true;
          },
          onEnd: function(evt) {
            if (evt.item.classList.contains('add-item')) return;

            const newItems = [...wishlistItems];
            const movedItem = newItems.splice(evt.oldIndex, 1)[0];
            newItems.splice(evt.newIndex, 0, movedItem);
            wishlistItems = newItems;
            
                saveWishlistItems()
            }
        });
      }
}

let wishlistSortable = null;

function openImageModal(itemId) {
    const item = wishlistItems.find(item => item.id === itemId);
    if (item) {
        const img = document.getElementById('modalImage');
        img.src = `${item.image}`;
        img.onerror = function(){
            closeModal();
            showNotification('no image found.', true);
        }
        
        imageModal.classList.add('active'); 
    }
}

function openEditModal(itemId) {
    const item = wishlistItems.find(item => item.id === itemId);
    if (item) {
        document.getElementById('editItemId').value = item.id;
        document.getElementById('editItemName').value = item.name;
        document.getElementById('editItemPrice').value = item.price;
        document.getElementById('editItemLink').value = item.link;
        document.getElementById('editItemImage').value = item.image;
        
        editModal.classList.add('active');
    }
}

function openDeleteModal(itemId) {
    document.getElementById('deleteItemId').value = itemId;
    deleteModal.classList.add('active');
}

function openPortifolioModal() {
    portifolioModal.classList.add('active');
}

function closeModal() {
    editModal.classList.remove('active');
    deleteModal.classList.remove('active');
    imageModal.classList.remove('active');
    addModal.classList.remove('active');
    portifolioModal.classList.remove('active');
}

editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const itemId = document.getElementById('editItemId').value;
    const itemName = document.getElementById('editItemName').value;
    const itemLink = document.getElementById('editItemLink').value;
    const itemImage = document.getElementById('editItemImage').value;
    const itemPrice = document.getElementById('editItemPrice').value;
    
    const itemIndex = wishlistItems.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
        wishlistItems[itemIndex] = {
            ...wishlistItems[itemIndex],
            name: itemName,
            price: itemPrice,
            link: itemLink,
            image: itemImage,
        };
        
        saveWishlistItems();
        renderWishlist();
        closeModal();
        
        showNotification('item edited successfully!');
    }
});

function confirmDelete() {
    const itemId = document.getElementById('deleteItemId').value;
    const itemIndex = wishlistItems.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        wishlistItems.splice(itemIndex, 1);
        saveWishlistItems();
        renderWishlist();
        closeModal();
        
        showNotification('item removed successfully!');
    }
}

function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.classList.toggle('error', isError);
    notification.classList.add('active');
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}


window.addEventListener('click', (e) => {
    if (e.target === editModal || e.target === deleteModal || e.target === imageModal || e.target === addModal || e.target === portifolioModal)
        closeModal();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape')
        closeModal();
    if (e.key === 'Enter' && deleteModal.classList.contains('active'))
        confirmDelete();
});