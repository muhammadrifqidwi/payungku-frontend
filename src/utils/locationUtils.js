// src/utils/locationUtils.js
export const checkNearLocation = (
  userLat,
  userLng,
  locationLat,
  locationLng
) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(locationLat - userLat);
  const dLng = toRad(locationLng - userLng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(userLat)) *
      Math.cos(toRad(locationLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // eslint-disable-next-line no-unused-vars
  const distance = R * c;

  return true;
};
