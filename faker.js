// generate_vehicles.js
const fs = require('fs');
const faker = require('@faker-js/faker').faker;

function generateVehicleData(count) {
    const statuses = ['running', 'not in use'];
    const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Dallas', 'Atlanta', 'Miami', 'Denver', 'Seattle'];
    const vehicles = [];

    for (let i = 0; i < count; i++) {
        const numberPlate = `XYZ-${faker.number.int({ min: 1000, max: 9999 })}`;
        const location = faker.helpers.arrayElement(locations);
        const cameraCount = faker.number.int({ min: 2, max: 3 });
        const installDate = faker.date.between({ from: '2022-01-01', to: '2025-01-01' }).toISOString().split('T')[0];
        const status = faker.helpers.arrayElement(statuses);

        const entry = `Number Plate: ${numberPlate}, Location: ${location}, Cameras: ${cameraCount}, Installed On: ${installDate}, Status: ${status}`;
        vehicles.push(entry);
    }

    return vehicles;
}

const data = generateVehicleData(50).join('\n');
fs.writeFileSync('vehicles.txt', data, 'utf-8');
console.log('vehicles.txt generated.');
