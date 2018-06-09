export const mathsRandomInt = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

const firstName = [
  'Luther',
  'Brain',
  'Camilla',
  'Weston',
  'Ida',
  'Granville',
  'Leda',
];

const lastName = [
  'Shields',
  'Jones',
  'Goyette',
  'Ankunding',
  'Rau',
  'Hilpert',
  'Powlowski',
];

const email = [
  'Rex52@yahoo.com',
  'Graciela.Simonis9@yahoo.com',
  'Bret20@hotmail.com',
  'Oleta.Eichmann55@gmail.com',
  'Garnett34@gmail.com',
  'Zechariah36@gmail.com',
  'Ruthe.Hyatt59@hotmail.com',
  'Lupe_Ullrich@hotmail.com',
];

const street = [
  'Nigel Groves',
  'VonRueden Village',
  'Glenna Burg',
  'Sister Freeway',
  'Raul Shoals',
  'Heathcote Rapids',
  'Bosco Mall',
  'Ethyl Roads',
  'Hailey Manor',
  'Jennyfer Way',
  'Grady Crescent',
];

const city = [
  'Paris',
  'London',
  'New York',
  'Las Vegas',
  'Berlin',
  'Lyon',
  'Tokyo',
  'East Micahberg',
  'Horaceshire',
  'Schmittbury',
];

export const getFirstName = () => {
  return firstName[mathsRandomInt(0, firstName.length - 1)];
};

export const getLastName = () => {
  return lastName[mathsRandomInt(0, lastName.length - 1)];
};

export const getEmail = () => {
  return email[mathsRandomInt(0, email.length - 1)];
};

export const getStreet = () => {
  return street[mathsRandomInt(0, street.length - 1)];
};

export const getCity = () => {
  return city[mathsRandomInt(0, city.length - 1)];
};

export const getAge = () => {
  return mathsRandomInt(18, 40);
};
