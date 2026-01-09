import { cache } from './cache';

// Simple cache test function
export async function testCache() {
	console.log('Testing cache performance...');
	
	// First call - should hit database
	const start1 = Date.now();
	const items1 = await cache.getItems();
	const time1 = Date.now() - start1;
	console.log(`First call (database): ${time1}ms`);
	
	// Second call - should hit cache
	const start2 = Date.now();
	const items2 = await cache.getItems();
	const time2 = Date.now() - start2;
	console.log(`Second call (cache): ${time2}ms`);
	
	// Verify data is the same
	const isSame = JSON.stringify(items1) === JSON.stringify(items2);
	console.log(`Data integrity: ${isSame ? 'PASS' : 'FAIL'}`);
	
	return {
		firstCallTime: time1,
		secondCallTime: time2,
		speedup: time1 > 0 ? (time1 / time2).toFixed(2) : 'N/A',
		dataIntegrity: isSame
	};
}
