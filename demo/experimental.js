async function fetchData() {
	const response = await fetch("/api/data");
	const data = await response.json();
	return data;
}

const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			console.log("Element is visible");
		}
	});
});

const resizeObserver = new ResizeObserver((entries) => {
	console.log("Element resized");
});

const text = "Hello World";
const newText = text.replaceAll("o", "0");

const items = [1, 2, 3, 4, 5];
const hasThree = items.includes(3);

Promise.resolve("done").then((result) => {
	console.log(result);
});

const mutationObserver = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		console.log("DOM changed:", mutation.type);
	});
});
