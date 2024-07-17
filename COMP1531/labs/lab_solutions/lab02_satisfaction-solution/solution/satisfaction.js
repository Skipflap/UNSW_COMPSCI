/**
 * @see satisfaction.alternative.js for a solution using the .sort() method
 * of arrays (although contains techniques taught in future weeks)
 *
 * @module satisfaction.js
 * A typical solution using knowledge from week 2.
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
  const sortedArray = [];
  for (const restaurant of fastFoodArray) {
    let index = 0;
    while (
      index < sortedArray.length &&
      compareRestaurant(restaurant, sortedArray[index]) > 0
    ) {
      index++;
    }
    // insert at index (the 0 means don't delete any elements)
    sortedArray.splice(index, 0, restaurant);
  }
  return sortedArray;
}

// ========================================================================= //

function getSatisfaction(restaurant) {
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
    const satisfactionRestaurant = {
      restaurantName: restaurant.name,
      satisfaction: getSatisfaction(restaurant),
    };
    let index = 0;
    while (
      index < satisfactionArray.length &&
      compareSatisfaction(satisfactionRestaurant, satisfactionArray[index]) > 0
    ) {
      index++;
    }
    // insert at index (the 0 means don't delete any elements)
    satisfactionArray.splice(index, 0, satisfactionRestaurant);
  }
  return satisfactionArray;
}
