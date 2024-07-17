/**
 * @see satisfaction.js for a solution without `.sort()`
 * You are not expected to understand arrow functions (=>) and other
 * techniques used below until later weeks :).
 */

function compareRestaurant(a, b) {
  if (a.customerService !== b.customerService) {
    return b.customerService - a.customerService;
  }
  if (a.foodVariety !== b.foodVariety) {
    return b.foodVariety - a.foodVariety;
  }
  if (a.valueForMoney !== b.valueForMoney) {
    return b.valueForMoney - a.valueForMoney;
  }
  if (a.timeToMake !== b.timeToMake) {
    return b.timeToMake - a.timeToMake;
  }
  if (a.taste !== b.taste) {
    return b.taste - a.taste;
  }
  return a.name.localeCompare(b.name);
}

function sortedFastFood(fastFoodArray) {
  return fastFoodArray.slice().sort(compareRestaurant);
}

// ========================================================================= //

function getSatisfaction (restaurant) {
  return (
    restaurant.customerService +
    restaurant.foodVariety +
    restaurant.valueForMoney +
    restaurant.timeToMake +
    restaurant.taste
  ) / 5;
}

function compareSatisfaction(a, b) {
  if (a.satisfaction !== b.satisfaction) {
    return b.satisfaction - a.satisfaction;
  }
  return a.restaurantName.localeCompare(b.restaurantName);
}

function sortedSatisfaction(fastFoodArray) {
  const satisfactionArray = [];
  for (const restaurant of fastFoodArray) {
    satisfactionArray.push({
      restaurantName: restaurant.name,
      satisfaction: getSatisfaction(restaurant),
    });
  }
  return satisfactionArray.sort(compareSatisfaction);
}
