/**
 * @see satisfaction.js for a typical solution using week 2 knowledge
 * @see satisfaction.alternative.js for a more advanced solution
 * that uses techniques in future weeks
 *
 * @module satisfaction.alternative.secret
 * A third set of solutions for this lab - only for those who are curious :).
 * There is no expectation that you understand any of the code below!
 */

function sortedFastFood(fastFoodArray) {
  return [...fastFoodArray].sort((a, b) => (
    b.customerService - a.customerService ||
    b.foodVariety - a.foodVariety ||
    b.valueForMoney - a.valueForMoney ||
    b.timeToMake - a.timeToMake ||
    b.taste - a.taste ||
    a.name.localeCompare(b.name)
  ));
}

// ========================================================================= //

function sortedSatisfaction(fastFoodArray) {
  const getSatisfaction = (restaurant) => {
    const { name, ...restaurantWithoutName } = restaurant;
    const ratings = Object.values(restaurantWithoutName);
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  };

  return fastFoodArray.map(r => ({
    restaurantName: r.name,
    satisfaction: getSatisfaction(r),
  })).sort((a, b) => (
    b.satisfaction - a.satisfaction ||
    a.restaurantName.localeCompare(b.restaurantName)
  ));
}
