const fs = require('fs');

const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Seattle', 'Denver', 'Boston', 'San Francisco', 'Atlanta'];
const statuses = ['running', 'not in use'];

function randomPlate() {
    const letters = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `${letters()}${letters()}${letters()}-${1000 + Math.floor(Math.random() * 9000)}`;
}

function randomDate(start, end) {
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return d.toISOString().split('T')[0];
}

function generateVehicleData() {
    const vehicles = [];

    for (let i = 0; i < 50; i++) {
        const plate = randomPlate();
        const location = locations[Math.floor(Math.random() * locations.length)];
        const cameraCount = Math.floor(Math.random() * 2) + 2; // 2 or 3
        const installDate = randomDate(new Date(2022, 0, 1), new Date());
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        vehicles.push(`Vehicle Number Plate: ${plate}\nLocation: ${location}\nNumber of Cameras: ${cameraCount}\nCamera Installation Date: ${installDate}\nStatus: ${status}\n`);
    }

    return vehicles.join('\n');
}

const data = generateVehicleData();

fs.writeFileSync('vehicles.txt', data);
console.log('vehicles.txt file created successfully!');
