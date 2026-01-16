const fs = require('fs');
const path = require('path');

// Sample data arrays
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
  'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Jason', 'Rebecca', 'Edward', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna', 'Stephen', 'Brenda',
  'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen',
  'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Gregory', 'Christine', 'Alexander', 'Debra',
  'Frank', 'Rachel', 'Raymond', 'Carolyn', 'Patrick', 'Janet', 'Jack', 'Virginia',
  'Dennis', 'Maria', 'Jerry', 'Heather', 'Tyler', 'Diane', 'Aaron', 'Julie',
  'Jose', 'Joyce', 'Henry', 'Victoria', 'Adam', 'Kelly', 'Douglas', 'Christina',
  'Nathan', 'Joan', 'Zachary', 'Evelyn', 'Kyle', 'Lauren', 'Noah', 'Judith',
  'Ethan', 'Megan', 'Jeremy', 'Cheryl', 'Walter', 'Andrea', 'Christian', 'Hannah',
  'Keith', 'Jacqueline', 'Roger', 'Martha', 'Terry', 'Gloria', 'Austin', 'Teresa',
  'Sean', 'Sara', 'Gerald', 'Janice', 'Carl', 'Marie', 'Harold', 'Julia',
  'Dylan', 'Grace', 'Arthur', 'Judy', 'Jordan', 'Theresa', 'Louis', 'Madison',
  'Wayne', 'Beverly', 'Eugene', 'Denise', 'Ralph', 'Marilyn', 'Mason', 'Amber',
  'Roy', 'Danielle', 'Eugene', 'Brittany', 'Vincent', 'Diana', 'Lawrence', 'Abigail',
  'Logan', 'Jane', 'Bryan', 'Lori', 'Philip', 'Alexis', 'Bobby', 'Tiffany'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
  'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez',
  'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
  'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards',
  'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers',
  'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly',
  'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks',
  'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
  'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross',
  'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell', 'Sullivan', 'Bell',
  'Coleman', 'Butler', 'Henderson', 'Barnes', 'Gonzales', 'Fisher', 'Vasquez', 'Simmons',
  'Romero', 'Jordan', 'Patterson', 'Alexander', 'Hamilton', 'Graham', 'Reynolds', 'Griffin',
  'Wallace', 'Moreno', 'West', 'Cole', 'Hayes', 'Bryant', 'Herrera', 'Gibson',
  'Ellis', 'Tran', 'Medina', 'Aguilar', 'Stevens', 'Murray', 'Ford', 'Castro',
  'Marshall', 'Owens', 'Harrison', 'Fernandez', 'Mcdonald', 'Woods', 'Washington', 'Kennedy',
  'Wells', 'Vargas', 'Henry', 'Chen', 'Freeman', 'Webb', 'Tucker', 'Guzman',
  'Burns', 'Crawford', 'Olson', 'Simpson', 'Porter', 'Hunter', 'Gordon', 'Mendez',
  'Silva', 'Shaw', 'Snyder', 'Mason', 'Dixon', 'Munoz', 'Hunt', 'Hicks',
  'Holmes', 'Palmer', 'Wagner', 'Black', 'Robertson', 'Boyd', 'Rose', 'Stone',
  'Salazar', 'Fox', 'Warren', 'Mills', 'Meyer', 'Rice', 'Schmidt', 'Garza',
  'Daniels', 'Ferguson', 'Nichols', 'Stephens', 'Soto', 'Weaver', 'Ryan', 'Gardner',
  'Payne', 'Grant', 'Dunn', 'Kelley', 'Spencer', 'Hawkins', 'Arnold', 'Pierce',
  'Vazquez', 'Hansen', 'Peters', 'Santos', 'Hart', 'Bradley', 'Knight', 'Elliott',
  'Cunningham', 'Duncan', 'Armstrong', 'Hudson', 'Carroll', 'Lane', 'Riley', 'Andrews',
  'Alvarado', 'Ray', 'Delgado', 'Berry', 'Perkins', 'Hoffman', 'Johnston', 'Matthews',
  'Pena', 'Richards', 'Contreras', 'Willis', 'Carpenter', 'Lawrence', 'Sandoval', 'Guerrero',
  'George', 'Chapman', 'Rios', 'Estrada', 'Ortega', 'Watkins', 'Greene', 'Nunez',
  'Wheeler', 'Valdez', 'Harper', 'Larson', 'Santiago', 'Maldonado', 'Morrison', 'Franklin',
  'Carlson', 'Austin', 'Dominguez', 'Carr', 'Lawson', 'Jacobs', 'Obrien', 'Lynch',
  'Singh', 'Vega', 'Bishop', 'Montgomery', 'Oliver', 'Jensen', 'Harvey', 'Williamson',
  'Gilbert', 'Dean', 'Sullivan', 'Wade', 'Hansen', 'Burke', 'Fuller', 'Castillo',
  'Fields', 'Douglas', 'McDonald', 'Harrison', 'Bryant', 'Gibson', 'Ellis', 'Graham'
];

const companies = [
  'Acme Corporation', 'Tech Solutions Inc', 'Global Industries', 'Premier Services',
  'Innovation Labs', 'Digital Dynamics', 'Strategic Partners', 'Elite Enterprises',
  'Summit Group', 'Apex Corporation', 'Nexus Technologies', 'Vertex Solutions',
  'Catalyst Systems', 'Momentum Ventures', 'Synergy Group', 'Horizon Industries',
  'Pinnacle Partners', 'Ascend Corporation', 'Zenith Solutions', 'Paragon Services',
  'Meridian Group', 'Stellar Systems', 'Quantum Technologies', 'Nova Industries',
  'Phoenix Corporation', 'Titan Solutions', 'Atlas Group', 'Orion Enterprises',
  'Aurora Systems', 'Eclipse Technologies', 'Lumina Corporation', 'Prism Solutions',
  'Spectrum Group', 'Fusion Industries', 'Matrix Corporation', 'Vector Solutions',
  'Alpha Group', 'Beta Technologies', 'Gamma Industries', 'Delta Corporation',
  'Epsilon Solutions', 'Zeta Group', 'Eta Technologies', 'Theta Industries',
  'Iota Corporation', 'Kappa Solutions', 'Lambda Group', 'Mu Technologies',
  'Nu Industries', 'Xi Corporation', 'Omicron Solutions', 'Pi Group',
  'Rho Technologies', 'Sigma Industries', 'Tau Corporation', 'Upsilon Solutions',
  'Phi Group', 'Chi Technologies', 'Psi Industries', 'Omega Corporation'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'San Francisco', 'Columbus',
  'Fort Worth', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston',
  'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis',
  'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento',
  'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh', 'Virginia Beach',
  'Miami', 'Oakland', 'Minneapolis', 'Tulsa', 'Cleveland', 'Wichita', 'Arlington', 'Tampa',
  'New Orleans', 'Honolulu', 'Anaheim', 'Santa Ana', 'St. Louis', 'Riverside', 'Corpus Christi',
  'Lexington', 'Henderson', 'Stockton', 'Saint Paul', 'St. Petersburg', 'Cincinnati', 'St. Louis',
  'Pittsburgh', 'Greensboro', 'Lincoln', 'Anchorage', 'Plano', 'Orlando', 'Irvine', 'Newark',
  'Durham', 'Chula Vista', 'Toledo', 'Fort Wayne', 'St. Petersburg', 'Laredo', 'Jersey City',
  'Chandler', 'Madison', 'Lubbock', 'Scottsdale', 'Reno', 'Buffalo', 'Gilbert', 'Glendale',
  'North Las Vegas', 'Winston-Salem', 'Chesapeake', 'Norfolk', 'Fremont', 'Garland', 'Irving',
  'Hialeah', 'Richmond', 'Boise', 'Spokane', 'Baton Rouge', 'Tacoma', 'San Bernardino',
  'Modesto', 'Fontana', 'Santa Clarita', 'Birmingham', 'Oxnard', 'Fayetteville', 'Moreno Valley',
  'Rochester', 'Glendale', 'Huntington Beach', 'Salt Lake City', 'Grand Rapids', 'Amarillo',
  'Yonkers', 'Aurora', 'Montgomery', 'Akron', 'Little Rock', 'Huntsville', 'Augusta',
  'Port St. Lucie', 'Grand Prairie', 'Columbus', 'Tallahassee', 'Overland Park', 'Tempe',
  'Santa Rosa', 'Vancouver', 'Sioux Falls', 'Ontario', 'Cape Coral', 'Vancouver', 'Erie',
  'Pembroke Pines', 'Salem', 'Corona', 'Eugene', 'McKinney', 'Fort Lauderdale', 'Santa Ana',
  'Elk Grove', 'Oxnard', 'Salem', 'Hayward', 'Fullerton', 'Orange', 'Pasadena', 'Escondido',
  'Lancaster', 'Concord', 'Palmdale', 'Salinas', 'Pomona', 'Hayward', 'Joliet', 'Torrance',
  'Yonkers', 'Surprise', 'Beaumont', 'Paterson', 'Rockford', 'El Monte', 'Carrollton',
  'Abilene', 'Visalia', 'Topeka', 'Thousand Oaks', 'Simi Valley', 'Olathe', 'Fargo',
  'Cedar Rapids', 'Elizabeth', 'Peoria', 'Mesquite', 'Bridgeport', 'Athens', 'McAllen',
  'Allentown', 'Miramar', 'Pasadena', 'Orange', 'Dayton', 'Fullerton', 'Hampton', 'Warren',
  'West Valley City', 'Midland', 'Waco', 'Charleston', 'Columbia', 'Savannah', 'Sterling Heights',
  'Round Rock', 'Abilene', 'Evansville', 'Clearwater', 'Rochester', 'Norman', 'Richmond',
  'Arvada', 'Cambridge', 'Sugar Land', 'Topeka', 'Thousand Oaks', 'El Monte', 'McKinney',
  'Concord', 'Visalia', 'Simi Valley', 'Olathe', 'Clarksville', 'Denton', 'St. Petersburg',
  'Provo', 'El Monte', 'Abilene', 'Beaumont', 'Peoria', 'Pembroke Pines', 'Erie', 'South Bend',
  'Downey', 'Lowell', 'Ventura', 'Inglewood', 'Waterbury', 'Palmdale', 'Richmond', 'Santa Clara',
  'Broken Arrow', 'Burbank', 'Clearwater', 'West Covina', 'Gresham', 'Fargo', 'San Mateo',
  'Daly City', 'Tempe', 'Santa Barbara', 'Everett', 'El Cajon', 'Santa Monica', 'Hillsboro',
  'Concord', 'Elgin', 'Pompano Beach', 'Gainesville', 'Fairfield', 'Berkeley', 'Richardson',
  'Pueblo', 'Arvada', 'South Bend', 'Lakeland', 'Erie', 'Tyler', 'Pearland', 'College Station',
  'Kenosha', 'Sunnyvale', 'Palm Bay', 'Pomona', 'Escondido', 'Pasadena', 'New Bedford',
  'Fairfield', 'Napa', 'Bellevue', 'Athens', 'Roseville', 'Thornton', 'Bellingham', 'Duluth',
  'Round Rock', 'Carlsbad', 'St. Cloud', 'Temecula', 'Clifton', 'Merced', 'Cambridge', 'Thousand Oaks'
];

const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

const streetTypes = ['St', 'Ave', 'Rd', 'Blvd', 'Ln', 'Dr', 'Ct', 'Way', 'Pl', 'Cir'];
const streetNames = [
  'Main', 'Park', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Lincoln', 'Jefferson',
  'Madison', 'Jackson', 'Adams', 'Monroe', 'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Harris',
  'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee',
  'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott',
  'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts',
  'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez',
  'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper',
  'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson',
  'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman',
  'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington', 'Butler',
  'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes'
];

const giftMessages = [
  'Thank you for your partnership!', 'Happy Holidays!', 'Wishing you a wonderful year ahead!',
  'Thank you for your continued support!', 'Happy New Year!', 'With appreciation and gratitude!',
  'Thank you for being an amazing client!', 'Wishing you joy and success!', 'Thank you for your business!',
  'Happy Holidays from our team!', 'With warm regards!', 'Thank you for your loyalty!',
  'Best wishes for the season!', 'Thank you for your trust!', 'Wishing you happiness and prosperity!',
  'Thank you for choosing us!', 'Happy Holidays and best wishes!', 'With sincere appreciation!',
  'Thank you for your dedication!', 'Wishing you continued success!', 'Happy Holidays to you and yours!',
  'Thank you for your commitment!', 'Best wishes for the holidays!', 'Thank you for your support!',
  'Wishing you a joyful holiday season!', 'Thank you for your partnership!', 'Happy Holidays!',
  'With gratitude and best wishes!', 'Thank you for your business!', 'Wishing you all the best!'
];

// Generate random number between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random element from array
function randomElement(array) {
  return array[randomInt(0, array.length - 1)];
}

// Generate random ZIP code
function randomZip() {
  return String(randomInt(10000, 99999));
}

// Generate random street number
function randomStreetNumber() {
  return randomInt(1, 9999);
}

// Generate random address
function randomAddress() {
  const streetNum = randomStreetNumber();
  const streetName = randomElement(streetNames);
  const streetType = randomElement(streetTypes);
  const hasSuite = Math.random() > 0.7;
  const suite = hasSuite ? `Suite ${randomInt(100, 999)}` : '';
  return {
    address1: `${streetNum} ${streetName} ${streetType}`,
    address2: suite
  };
}

// Generate CSV content
function generateCSV(numRows) {
  const header = 'first_name,last_name,company,address1,address2,city,state,zip,gift_message\n';
  const rows = [];
  
  for (let i = 0; i < numRows; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const hasCompany = Math.random() > 0.3; // 70% have companies
    const company = hasCompany ? randomElement(companies) : '';
    const { address1, address2 } = randomAddress();
    const city = randomElement(cities);
    const state = randomElement(states);
    const zip = randomZip();
    const hasMessage = Math.random() > 0.5; // 50% have gift messages
    const giftMessage = hasMessage ? randomElement(giftMessages) : '';
    
    const row = [
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      state,
      zip,
      giftMessage
    ].map(field => `"${field}"`).join(',');
    
    rows.push(row);
  }
  
  return header + rows.join('\n');
}

// Generate the CSV file
const csvContent = generateCSV(250);
const outputPath = path.join(__dirname, '../public/template.csv');

fs.writeFileSync(outputPath, csvContent, 'utf-8');
console.log(`✅ Generated CSV template with 250 test entries`);
console.log(`📁 Saved to: ${outputPath}`);
console.log(`📊 Total rows: 251 (1 header + 250 data rows)`);
