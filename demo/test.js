async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            console.log('Element is visible');
        }
    });
});

const items = ['apple', 'banana', 'cherry'];
const foundItem = items.find(item => item.includes('ban'));

const data = {
    name: 'John',
    age: 30
};

const { name, age } = data;
const spreadData = { ...data, city: 'New York' };

if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
        console.log(position.coords);
    });
}

localStorage.setItem('user', JSON.stringify(data));